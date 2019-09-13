import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

/**
 * Link pointing to external source opened in new tab.
 * @param {object} param0
 * @param {string} param0.href
 * @param {string|React.ReactNode} [param0.text]
 * @param {React.ReactNode} [param0.children]
 * @param {string} [param0.className]
 * @param {boolean} [param0.block]
 * @param {boolean} [param0.indicator]
 */
export const ExternalLink = ({ href, text, className, children, block, indicator, ...otherProps }) => (
  <a
    className={classNames('oh-external-link', { block, indicator }, className)}
    href={href.startsWith('http') ? href : `http://${href}`}
    target="_blank"
    rel="noopener noreferrer"
    {...otherProps}
  >
    {text}
    {children}
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
