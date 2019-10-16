import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { markdownConverter } from '../common/markdown';

export interface MarkdownViewProps{
  markdown: string
  className?: string}

/**
 * Parse markdown and preview it
 */
export const MarkdownView: React.FC<MarkdownViewProps & React.HTMLAttributes<HTMLDivElement>> = ({ className, markdown, ...props }) => (
  <div
    className={classNames('oh-markdown-view', className)}
    {...props}
    dangerouslySetInnerHTML={{ __html: markdownConverter.makeHtml(markdown) }}
  />
);

MarkdownView.propTypes = {
  markdown: PropTypes.string.isRequired,
  className: PropTypes.string
};

MarkdownView.defaultProps = {
  className: '',
  markdown: ''
};
