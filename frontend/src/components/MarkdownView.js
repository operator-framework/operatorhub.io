import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { markdownConverter } from '../common/markdown';

/**
 * Parse markdown and preview it
 * @param {object} param0
 * @param {string} param0.markdown
 * @param {string} [param0.className]
 *
 */
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
