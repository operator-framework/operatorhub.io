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
import { getValueError, getDefaultDeployment, isDeploymentDefault } from '../../utils/operatorUtils';
import { operatorFieldValidators } from '../../utils/operatorDescriptors';
import { storeEditorFormErrorsAction, storeEditorOperatorAction } from '../../redux/actions/editorActions';

const deploymentFields = sectionsFields.deployments;

class OperatorDeploymentEditPage extends React.Component {
  /**
   * @type {Object} state
   * @prop {string} state.deploymentYaml
   * @prop {string|string[]} state.yamlError
   */
  state = {
    deploymentYaml: '',
    yamlError: ''
  };

  name;

  componentDidMount() {
    this.name = helpers.transformPathedName(_.get(this.props.match, 'params.deployment', ''));

    const deployment = this.getDeployment();
    let deploymentYaml;
    /** @type {string|string[]} */
    let yamlError = '';
    try {
      deploymentYaml = safeDump(deployment);

      // validate on first open in case we have non default deployment
      if (!isDeploymentDefault(deployment)) {
        yamlError = this.validateDeployment(deployment);
      }
    } catch (e) {
      deploymentYaml = '';
      yamlError = e.message;
    }

    this.setState({ deploymentYaml, yamlError });
  }

  getDeployment = () => {
    const { operator, storeEditorOperator } = this.props;
    const operatorDeployments = _.get(operator, deploymentFields, []);

    let deployment = _.find(operatorDeployments, { name: this.name });

    if (!deployment) {
      const updatedOperator = _.cloneDeep(operator);
      const updatedDeployments = _.get(updatedOperator, deploymentFields, []);

      deployment = getDefaultDeployment();

      updatedDeployments.push(deployment);

      _.set(updatedOperator, deploymentFields, updatedDeployments);
      storeEditorOperator(updatedOperator);
    }

    return deployment;
  };

  updateOperator = updatedDeployment => {
    const { operator, storeEditorOperator } = this.props;

    const updatedOperator = _.cloneDeep(operator);
    const deployments = _.get(updatedOperator, deploymentFields);
    // use orignal name
    const deploymentIndex = _.findIndex(deployments, { name: this.name });

    // update name ref for case it changed
    this.name = updatedDeployment.name || this.name;

    const updatedDeployments = [
      ...deployments.slice(0, deploymentIndex),
      updatedDeployment,
      ...deployments.slice(deploymentIndex + 1)
    ];
    _.set(updatedOperator, deploymentFields, updatedDeployments);

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
    /** @type {string|string[]} */
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

  getDefaultOnClear = () => {
    const deployment = getDefaultDeployment();
    let deploymentYaml = '';

    try {
      deploymentYaml = safeDump(deployment);
    } catch (e) {
      console.warn("Can't convert default deployment to yaml!");
    }

    return deploymentYaml;
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
          <YamlViewer
            yaml={deploymentYaml}
            onBlur={this.onYamlChange}
            editable
            error={yamlError}
            allowClear
            onClear={this.getDefaultOnClear}
          />
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
