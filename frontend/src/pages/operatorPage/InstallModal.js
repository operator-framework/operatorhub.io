import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';

import { ExpandCollapse, Modal } from 'patternfly-react';
import { CatalogItemHeader } from 'patternfly-react-extensions';

import { helpers } from '../../common/helpers';
import * as operatorImg from '../../imgs/operator.svg';

const INSTALL_OLM_COMMAND =
  '$kubectl create -f https://raw.githubusercontent.com/operator-framework/operator-lifecycle-manager/master/deploy/upstream/manifests/latest/';

const InstallModal = ({ show, operator, onClose }) => (
  <Modal show={show} onHide={onClose} bsSize="lg" className="oh-install-modal right-side-modal-pf">
    {_.get(operator, 'displayName') && (
      <React.Fragment>
        <Modal.Header>
          <Modal.CloseButton onClick={onClose} />
          <CatalogItemHeader
            iconImg={_.get(operator, 'imgUrl') || operatorImg}
            title={_.get(operator, 'displayName')}
            vendor={`${_.get(operator, 'version')} provided by ${_.get(operator, 'provider')}`}
          />
        </Modal.Header>
        <Modal.Body>
          <h2 className="oh-install-modal__title">Install on Kubernetes</h2>
          <ExpandCollapse
            className="oh-install-expander"
            textCollapsed="Show Prerequisites"
            textExpanded="Hide Prerequisites"
          >
            <div className="oh-install-olm-instructions">
              <p>
                Install Operator Lifecycle Manager (OLM), a tool to help manage the Operators running on your cluster.
                Platforms like OpenShift / OKD will have it pre-installed.
              </p>
              <div className="oh-code">
                <code>{INSTALL_OLM_COMMAND}</code>
              </div>
            </div>
          </ExpandCollapse>

          <p>Install the operator by running the following command:</p>
          <div className="oh-code">
            {`kubectl create -f https://operatorhub.io/install/${_.get(operator, 'name')}.yaml`}
          </div>
          <p>
            After install, checkout the custom resource definitions (CRDs) introduced by this operator to start using
            it.
          </p>
        </Modal.Body>
      </React.Fragment>
    )}
  </Modal>
);

InstallModal.propTypes = {
  show: PropTypes.bool,
  operator: PropTypes.object,
  onClose: PropTypes.func
};

InstallModal.defaultProps = {
  show: false,
  operator: null,
  onClose: helpers.noop
};

export default InstallModal;
