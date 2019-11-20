import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { safeDump } from 'js-yaml';
import { Modal } from 'patternfly-react';

import { noop } from '../../common/helpers';
import YamlViewer from '../YamlViewer';

export interface ExampleYamlModalProps {
  show?: boolean
  customResourceDefinition: { displayName: string, yamlExample: any},
  onClose?: (e?: React.MouseEvent) => void
}

const ExampleYamlModal: React.FC<ExampleYamlModalProps> = ({ show, customResourceDefinition, onClose }) => {
  const renderContents = () => {
    const { displayName, yamlExample } = customResourceDefinition;
    let yaml = '';

    if (yamlExample) {
      try {
        if (!_.isString(yamlExample)) {
          yaml = safeDump(yamlExample);
        } else {
          yaml = yamlExample;
        }
      } catch (e) {
        yaml = `Error dumping YAML: ${e}`;
      }
    }

    return (
      <React.Fragment>
        <Modal.Header>
          <Modal.CloseButton onClick={onClose} />
          <Modal.Title>{displayName} - YAML Example</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <YamlViewer yaml={yaml} />
        </Modal.Body>
      </React.Fragment>
    );
  };

  return (
    <Modal show={show} onHide={onClose} bsSize="lg" className="oh-yaml-viewer__modal right-side-modal-pf">
      {customResourceDefinition && renderContents()}
    </Modal>
  );
};

ExampleYamlModal.propTypes = {
  show: PropTypes.bool,
  customResourceDefinition: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    yamlExample: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
  }).isRequired,
  onClose: PropTypes.func
};

ExampleYamlModal.defaultProps = {
  show: false,
  onClose: noop
};

export default ExampleYamlModal;
