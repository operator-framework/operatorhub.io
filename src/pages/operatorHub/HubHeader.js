import React from 'react';
import PropTypes from 'prop-types';

import { HeaderTopBar } from '../../components/HeaderTopBar';
import { helpers } from '../../common/helpers';

const HubHeader = ({ searchCallback, clearSearch, searchValue, headerRef, topBarRef, ...props }) => (
  <div className="oh-header oh-hub-header" ref={headerRef} {...props}>
    <HeaderTopBar
      searchCallback={searchCallback}
      clearSearch={clearSearch}
      searchValue={searchValue}
      barRef={topBarRef}
    />
    <div className="oh-header__content">
      <h1 className="oh-hub-header__content__title">
        Welcome to
        <span className="title">OperatorHub</span>
      </h1>
      <div className="oh-hub-header__content__sub-title">
        <p>
          Operators deliver the automation advantages of cloud services like provisioning, scaling, and backup/restore
          while being able to run anywhere that Kubernetes can run.
        </p>
      </div>
    </div>
  </div>
);

HubHeader.propTypes = {
  searchCallback: PropTypes.func.isRequired,
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
