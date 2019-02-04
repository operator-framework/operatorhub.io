import React from 'react';
import PropTypes from 'prop-types';

import { HeaderTopBar } from '../../components/HeaderTopBar';
import { helpers } from '../../common/helpers';

const HubHeader = ({ onSearchChange, clearSearch, searchValue, headerRef, topBarRef, ...props }) => (
  <div className="oh-header oh-hub-header" ref={headerRef} {...props}>
    <div className="oh-header__inner">
      <HeaderTopBar
        onSearchChange={onSearchChange}
        clearSearch={clearSearch}
        searchValue={searchValue}
        barRef={topBarRef}
      />
      <div className="oh-header__content">
        <h1 className="oh-hub-header__content__title oh-hero">Welcome to OperatorHub</h1>
        <p className="oh-hub-header__content__sub-title">
          Operators deliver the automation advantages of cloud services like provisioning, scaling, and backup/restore
          while being able to run anywhere that Kubernetes can run.
        </p>
      </div>
    </div>
  </div>
);

HubHeader.propTypes = {
  onSearchChange: PropTypes.func.isRequired,
  clearSearch: PropTypes.func.isRequired,
  searchValue: PropTypes.string,
  headerRef: PropTypes.func,
  topBarRef: PropTypes.func
};

HubHeader.defaultProps = {
  searchValue: '',
  headerRef: helpers.noop,
  topBarRef: helpers.noop
};

export { HubHeader };
