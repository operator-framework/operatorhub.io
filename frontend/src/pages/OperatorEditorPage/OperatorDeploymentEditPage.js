import * as React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import { getFieldValueError } from '../../utils/operatorUtils';
import DeploymentsEditor from '../../components/editor/DeploymentsEditor';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import { safeDump, safeLoad } from 'js-yaml';
import YamlEditor from '../../components/YamlViewer';

class OperatorDeploymentEditPage extends React.Component {
  state = {
    deployment: null,
    deploymentYaml: ''
  };

  componentDidMount() {
    const { operator, storeEditorOperator } = this.props;
    const name = _.get(this.props.match, 'params.deployment');

    let operatorDeployments = _.get(operator, 'spec.install.spec.deployments');

    let deployment;
    if (deployment === 'Add Deployment') {
      deployment = _.find(operatorDeployments, { name: 'New Deployment' });
    } else {
      deployment = _.find(operatorDeployments, { name });
    }

    if (!deployment) {
      deployment = { name: 'New Deployment' };
      if (!_.size(operatorDeployments)) {
        operatorDeployments = [];
      }

      operatorDeployments.push(deployment);
      const updatedOperator = _.cloneDeep(operator);
      _.set(updatedOperator, 'spec.install.spec.deployments', operatorDeployments);
      storeEditorOperator(updatedOperator);
    }

    let deploymentYaml;
    let yamlError;
    try {
      deploymentYaml = safeDump(deployment);
      yamlError = '';
    } catch (e) {
      deploymentYaml = '';
      yamlError = e.message;
    }

    this.setState({ deployment, deploymentYaml, yamlError });
  }

  updateOperator = updatedDeployment => {
    const { operator, storeEditorOperator } = this.props;
    const { deployment } = this.state;

    const updatedOperator = _.cloneDeep(operator);
    const deployments = _.get(updatedOperator, 'spec.install.spec.deployments');
    const deploymentIndex = _.findIndex(deployments, { name: deployment.name });
    const updatedDeployments = [
      ...deployments.slice(0, deploymentIndex),
      updatedDeployment,
      ...deployments.slice(deploymentIndex + 1)
    ];
    _.set(updatedOperator, 'spec.install.spec.deployments', updatedDeployments);

    this.setState({ deployment: updatedDeployment });
    storeEditorOperator(updatedOperator);
  };

  onYamlChange = yaml => {
    let yamlError;
    try {
      const updatedDeployment = safeLoad(yaml);
      yamlError = '';
      this.updateOperator(updatedDeployment);
    } catch (e) {
      yamlError = e.message;
    }
    this.setState({ yamlError });
  };

  render() {
    const { history } = this.props;
    const { deploymentYaml, yamlError } = this.state;
    return (
      <OperatorEditorSubPage
        title="Edit Deployment"
        field="spec.install.spec.deployments"
        tertiary
        lastPage="deployments"
        lastPageTitle="Deploments"
        history={history}
      >
        <div className="oh-operator-editor-deployment">
          <YamlEditor
            yaml={deploymentYaml}
            onBlur={this.onYamlChange}
            editable
            error={yamlError}
            allowClear
          />
        </div>
      </OperatorEditorSubPage>
    );
  }
}

OperatorDeploymentEditPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired
};

OperatorDeploymentEditPage.defaultProps = {
  operator: {},
  formErrors: {},
  storeEditorFormErrors: helpers.noop,
  storeEditorOperator: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  storeEditorOperator: operator =>
    dispatch({
      type: reduxConstants.SET_EDITOR_OPERATOR,
      operator
    }),
  storeEditorFormErrors: formErrors =>
    dispatch({
      type: reduxConstants.SET_EDITOR_FORM_ERRORS,
      formErrors
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorDeploymentEditPage);
