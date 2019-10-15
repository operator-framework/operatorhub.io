import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

/**
 * Internal link inside website. Scrolls to top on navigation
 * @param {object} param0
 * @param {string} param0.route
 * @param {*} param0.history
 * @param {string} [param0.text]
 * @param {*} [param0.children]
 * @param {string} [param0.className]
 * @param {string} [param0.block]
 * @param {string} [param0.text]
 * @param {boolean} [param0.noNavigation]
 */
export const InternalLink = ({ text, children, className, block, route, history, noNavigation, ...otherProps }) => {
  const onClick = e => {
    e.preventDefault();
    if (!noNavigation) {
      history.push(route);
    } else {
      const scrollToElem = document.getElementById('page-top');
      if (scrollToElem) {
        scrollToElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
  route: PropTypes.string.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  text: PropTypes.string,
  children: PropTypes.node,
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
