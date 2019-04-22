import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { helpers } from '../common/helpers';

export const MarkdownView = ({ className, markdown, ...props }) => (
  <div
    className={classNames('oh-markdown-view', className)}
    {...props}
    dangerouslySetInnerHTML={{ __html: helpers.markdownConverter.makeHtml(markdown) }}
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
