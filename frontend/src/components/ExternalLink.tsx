import React, { ReactNode } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export interface ExternalLinkProps{
  href: string
  text?: ReactNode
  className?: string
  block?: boolean
  indicator?: boolean
  [prop: string]: any
}

/**
 * Link pointing to external source opened in new tab.
 */
export const ExternalLink: React.FC<ExternalLinkProps> = ({ href, text, className, children, block, indicator, ...otherProps }) => (
  <a
    className={classNames('oh-external-link', { block, indicator }, className)}
    href={href.startsWith('http') ? href : `http://${href}`}
    target="_blank"
    rel="noopener noreferrer"
    {...otherProps}
  >
    {text}
    {children || null}
  </a>
);

ExternalLink.propTypes = {
  href: PropTypes.string.isRequired,
  text: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  block: PropTypes.bool,
  indicator: PropTypes.bool
};

ExternalLink.defaultProps = {
  className: '',
  text: '',
  children: null,
  block: false,
  indicator: true
};
