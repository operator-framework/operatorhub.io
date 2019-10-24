import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { History } from 'history';

export interface InternalLinkProps {
  route: string
  history: History
  text?: string
  className?: string
  block?: boolean
  noNavigation?: boolean
  [prop: string]: any
}

/**
 * Internal link inside website. Scrolls to top on navigation
 */
const InternalLink: React.FC<InternalLinkProps> = ({ text, children, className, block, route, history, noNavigation, ...otherProps }) => {

  const onClick = e => {
    e.preventDefault();

    if (!noNavigation) {
      history.push(route);

    } else {
      const scrollToElem = document.getElementById('page-top');
      scrollToElem && scrollToElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a className={classNames({ block }, className)} href={route} onClick={onClick} {...otherProps}>
      {text}
      {children || null}
    </a>
  );
};

InternalLink.propTypes = {
  route: PropTypes.string.isRequired,
  history: PropTypes.any.isRequired,
  text: PropTypes.string,
  block: PropTypes.bool,
  className: PropTypes.string,
  noNavigation: PropTypes.bool
};

InternalLink.defaultProps = {
  className: '',
  text: '',
  block: false,
  noNavigation: false
};

export { InternalLink };