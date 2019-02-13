import * as React from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'patternfly-react';
import { CatalogItemHeader } from 'patternfly-react-extensions';

import { helpers } from '../../common/helpers';
import * as operatorImg from '../../imgs/operator.svg';

const InstallModal = ({ show, operator, onClose }) => {
  const { imgUrl, displayName, name, version, provider } = operator;
  return (
    <Modal show={show} onHide={onClose} bsSize="lg" className="oh-install-modal right-side-modal-pf">
      {displayName && (
        <React.Fragment>
          <Modal.Header>
            <Modal.CloseButton onClick={onClose} />
            <CatalogItemHeader
              iconImg={imgUrl || operatorImg}
              title={displayName}
              vendor={`${version} provided by ${provider}`}
            />
          </Modal.Header>
          <Modal.Body>
            <p>
              We need to have a visual popup upon clicking <i>install</i> that shows instructions to install on OCP and
              Kube (which in turns asks to install OLM/Marketplace) and then a single line command like:
            </p>
            <p>
              <span className="oh-code oh-indent">
                {`kubectl create -f https://operatorhub.io/#/operators/${name}/install.yaml`}
              </span>
            </p>
          </Modal.Body>
        </React.Fragment>
      )}
    </Modal>
  );
};

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
