import * as React from 'react';
import * as classNames from 'classnames';
import PropTypes from 'prop-types';

export const InternalLink = ({ text, children, className, block, route, history, noNavigation, ...otherProps }) => {
  const onClick = e => {
    e.preventDefault();
    if (!noNavigation) {
      history.push(route);
    }
  };

  return (
    <a className={classNames({ block }, className)} href={route} onClick={onClick} {...otherProps}>
      {text}
      {children}
    </a>
  );
};

InternalLink.propTypes = {
  text: PropTypes.string,
  children: PropTypes.node,
  route: PropTypes.string.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  block: PropTypes.bool,
  className: PropTypes.string,
  noNavigation: PropTypes.bool
};

InternalLink.defaultProps = {
  className: '',
  text: '',
  children: null,
  block: false,
  noNavigation: false
};
