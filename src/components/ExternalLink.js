import * as React from 'react';
import * as classNames from 'classnames';
import PropTypes from 'prop-types';

export const ExternalLink = ({ href, text, className, ...otherProps }) => (
  <a
    className={classNames('oh-external-link', className)}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    {...otherProps}
  >
    {text}
  </a>
);

ExternalLink.propTypes = {
  href: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  className: PropTypes.string
};

ExternalLink.defaultProps = {
  className: ''
};
