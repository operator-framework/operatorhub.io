import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import { safeDump } from 'js-yaml';
import { Modal } from 'patternfly-react';

import { helpers } from '../../common/helpers';
import YamlViewer from '../YamlViewer';

const ExampleYamlModal = ({ show, customResourceDefinition, onClose }) => {
  const renderContents = () => {
    const { displayName, yamlExample } = customResourceDefinition;
    let yaml;

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
  customResourceDefinition: PropTypes.object,
  onClose: PropTypes.func
};

ExampleYamlModal.defaultProps = {
  show: false,
  customResourceDefinition: null,
  onClose: helpers.noop
};

export default ExampleYamlModal;
