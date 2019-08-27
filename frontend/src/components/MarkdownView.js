import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { markdownConverter } from '../common/markdown';

export const MarkdownView = ({ className, markdown, ...props }) => (
  <div
    className={classNames('oh-markdown-view', className)}
    {...props}
    dangerouslySetInnerHTML={{ __html: markdownConverter.makeHtml(markdown) }}
  />
);

MarkdownView.propTypes = {
  className: PropTypes.string,
  markdown: PropTypes.string
};

MarkdownView.defaultProps = {
  className: '',
  markdown: ''
};
