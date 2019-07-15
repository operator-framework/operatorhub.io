import * as React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import { safeDump, safeLoad } from 'js-yaml';

import { helpers } from '../../common/helpers';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import YamlViewer from '../../components/YamlViewer';
import { sectionsFields } from './bundlePageUtils';
import { getValueError, getDefaultDeployment } from '../../utils/operatorUtils';
import { operatorFieldValidators } from '../../utils/operatorDescriptors';
import { storeEditorFormErrorsAction, storeEditorOperatorAction } from '../../redux/actions/editorActions';

const deploymentFields = sectionsFields.deployments;

class OperatorDeploymentEditPage extends React.Component {
  state = {
    deployment: null,
    deploymentYaml: ''
  };

  componentDidMount() {
    const { operator, storeEditorOperator } = this.props;
    const name = helpers.transformPathedName(_.get(this.props.match, 'params.deployment', ''));

    const operatorDeployments = _.get(operator, deploymentFields, []);

    let deployment = _.find(operatorDeployments, { name });

    if (!deployment) {
      deployment = getDefaultDeployment();

      // override name so its obvious that its new
      deployment.name = 'Add Deployment';

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

  validateDeployment = deployment => {
    const { operator } = this.props;

    const deploymentValidator = _.get(operatorFieldValidators, 'spec.install.spec.deployments.itemValidator');

    const errs = Object.keys(deploymentValidator)
      .map(key => getValueError(deployment[key], deploymentValidator[key], operator))
      .filter(err => err !== null);

    const errsText = [];

    errs.forEach((err, index) => {
      index > 0 && errsText.push(<br key={index} />);
      errsText.push(<span key={index}>{err}</span>);
    });

    return errsText.length > 0 ? errsText : null;
  };

  onYamlChange = yaml => {
    let yamlError = '';
    try {
      const updatedDeployment = safeLoad(yaml);

      yamlError = this.validateDeployment(updatedDeployment);

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
  ...bindActionCreators(
    {
      storeEditorOperator: storeEditorOperatorAction,
      storeEditorFormErrors: storeEditorFormErrorsAction
    },
    dispatch
  )
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorDeploymentEditPage);
