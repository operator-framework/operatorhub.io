import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';

export const MarkdownView = ({ className, children, ...props }) => (
  <ReactMarkdown className={classNames('oh-markdown-view', className)} linkTarget={() => '_blank'} {...props}>
    {children}
  </ReactMarkdown>
);

MarkdownView.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

MarkdownView.defaultProps = {
  className: '',
  children: null
};
