import * as React from 'react';
import * as classNames from 'classnames';
import PropTypes from 'prop-types';

export const ExternalLink = ({ href, text, className, block, indicator, ...otherProps }) => (
  <a
    className={classNames('oh-external-link', { block, indicator }, className)}
    href={href.startsWith('http') ? href : `http://${href}`}
    target="_blank"
    rel="noopener noreferrer"
    {...otherProps}
  >
    {text}
  </a>
);

ExternalLink.propTypes = {
  href: PropTypes.string.isRequired,
  text: PropTypes.node,
  block: PropTypes.bool,
  className: PropTypes.string,
  indicator: PropTypes.bool
};

ExternalLink.defaultProps = {
  className: '',
  text: '',
  block: false,
  indicator: true
};
