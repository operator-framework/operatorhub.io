import React from 'react';

import { HeaderTopBar } from '../../components/HeaderTopBar';

const HubHeader = ({ ...props }) => (
  <div className="oh-header oh-hub-header" {...props}>
    <HeaderTopBar />
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

export { HubHeader };
