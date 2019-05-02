import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import { safeDump, safeLoad } from 'js-yaml';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import YamlViewer from '../../components/YamlViewer';
import { sectionsFields } from './bundlePageUtils';

const deploymentFields = sectionsFields.deployments;

class OperatorDeploymentEditPage extends React.Component {
  state = {
    deployment: null,
    deploymentYaml: ''
  };

  componentDidMount() {
    const { operator, storeEditorOperator } = this.props;
    const name = helpers.transformPathedName(_.get(this.props.match, 'params.deployment', ''));

    let operatorDeployments = _.get(operator, deploymentFields);

    let deployment = _.find(operatorDeployments, { name });

    if (!deployment) {
      deployment = { name: 'Add Deployment' };
      if (!_.size(operatorDeployments)) {
        operatorDeployments = [];
      }

      operatorDeployments.push(deployment);
      const updatedOperator = _.cloneDeep(operator);
      _.set(updatedOperator, deploymentFields, operatorDeployments);
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
    const deployments = _.get(updatedOperator, deploymentFields);
    const deploymentIndex = _.findIndex(deployments, { name: deployment.name });
    const updatedDeployments = [
      ...deployments.slice(0, deploymentIndex),
      updatedDeployment,
      ...deployments.slice(deploymentIndex + 1)
    ];
    _.set(updatedOperator, deploymentFields, updatedDeployments);

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
        field={deploymentFields}
        tertiary
        lastPage="deployments"
        lastPageTitle="Deployments"
        history={history}
      >
        <div className="oh-operator-editor-deployment">
          <YamlViewer yaml={deploymentYaml} onBlur={this.onYamlChange} editable error={yamlError} allowClear />
        </div>
      </OperatorEditorSubPage>
    );
  }
}

OperatorDeploymentEditPage.propTypes = {
  operator: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired
};

OperatorDeploymentEditPage.defaultProps = {
  operator: {},
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
