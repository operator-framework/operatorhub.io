import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import { Grid, Modal } from 'patternfly-react';

import { helpers } from '../../common/helpers';
import OperatorSidePanel from '../OperatorSidePanel';
import { MarkdownView } from '../MarkdownView';
import CustomResourceDefinitionsView from '../CustomResourceDefinitionsView';
import * as operatorImg from '../../imgs/operator.svg';
import ExampleYamlModal from './ExampleYamlModal';
import { normalizeOperator } from '../../utils/operatorUtils';

class PreviewOperatorModal extends React.Component {
  state = {
    operator: null,
    exampleYamlShown: false,
    crdExample: null
  };

  componentDidUpdate(prevProps) {
    const { show, yamlOperator } = this.props;
    if (show) {
      if (!prevProps.show || !_.isEqual(yamlOperator, prevProps.yamlOperator)) {
        const operator = normalizeOperator(yamlOperator);
        this.setState({ operator });
      }
    }
  }

  showExampleYaml = (e, crd) => {
    e.preventDefault();
    this.setState({ exampleYamlShown: true, crdExample: crd });
  };

  hideExampleYaml = () => {
    this.setState({ exampleYamlShown: false });
  };

  renderOperatorPreview = operator => (
    <React.Fragment>
      <div className="oh-header">
        <div className="oh-header__inner">
          <div className="oh-operator-header__content">
            <div className="oh-operator-header__image-container">
              <img className="oh-operator-header__image" src={_.get(operator, 'imgUrl') || operatorImg} alt="" />
            </div>
            <div className="oh-operator-header__info">
              <h1 className="oh-operator-header__title oh-hero">{_.get(operator, 'displayName')}</h1>
              <div className="oh-operator-header__description">{_.get(operator, 'description')}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="oh-preview-page-yaml__preview-separator" />
      <div className="oh-operator-page row">
        <Grid.Col xs={12} sm={4} smPush={8} md={3} mdPush={9}>
          <OperatorSidePanel operator={operator} />
        </Grid.Col>
        <Grid.Col xs={12} sm={8} smPull={4} md={9} mdPull={3}>
          <h1>{operator.displayName}</h1>
          {operator.longDescription && <MarkdownView markdown={operator.longDescription} />}
          <CustomResourceDefinitionsView operator={operator} showExampleYaml={this.showExampleYaml} />
        </Grid.Col>
      </div>
    </React.Fragment>
  );

  render() {
    const { show, onClose } = this.props;
    const { operator, exampleYamlShown, crdExample } = this.state;

    return (
      <Modal show={show} onHide={onClose} bsSize="lg" className="oh-yaml-viewer__modal right-side-modal-pf">
        <Modal.Header>
          <Modal.CloseButton onClick={onClose} />
          <Modal.Title>Preview of your Operator</Modal.Title>
        </Modal.Header>
        <Modal.Body>{operator && this.renderOperatorPreview(operator)}</Modal.Body>
        <ExampleYamlModal
          show={exampleYamlShown}
          customResourceDefinition={crdExample}
          onClose={this.hideExampleYaml}
        />
      </Modal>
    );
  }
}

PreviewOperatorModal.propTypes = {
  show: PropTypes.bool,
  yamlOperator: PropTypes.object,
  onClose: PropTypes.func
};

PreviewOperatorModal.defaultProps = {
  show: false,
  yamlOperator: null,
  onClose: helpers.noop
};

export default PreviewOperatorModal;
