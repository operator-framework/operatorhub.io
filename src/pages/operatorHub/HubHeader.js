import React from 'react';
import PropTypes from 'prop-types';

import { HeaderTopBar } from '../../components/HeaderTopBar';

const HubHeader = ({ searchCallback, clearSearch, searchValue, ...props }) => (
  <div className="oh-header oh-hub-header" {...props}>
    <HeaderTopBar searchCallback={searchCallback} clearSearch={clearSearch} searchValue={searchValue} />
    <div className="oh-header__content">
      <h1 className="oh-hub-header__content__title">
        Welcome to
        <span className="title">OperatorHub</span>
      </h1>
      <div className="oh-hub-header__content__sub-title">
        <div className="spacer" />
        <p>
          Operators deliver the automation advantages of cloud services like provisioning, scaling, and backup/restore
          while being able to run anywhere that Kubernetes can run.
        </p>
        <div className="spacer" />
      </div>
    </div>
  </div>
);

HubHeader.propTypes = {
  searchCallback: PropTypes.func.isRequired,
  clearSearch: PropTypes.func.isRequired,
  searchValue: PropTypes.string
};

HubHeader.defaultProps = {
  searchValue: ''
};

export { HubHeader };
