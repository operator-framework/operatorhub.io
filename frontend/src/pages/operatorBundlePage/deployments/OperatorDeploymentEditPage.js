import * as React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import { safeDump, safeLoad } from 'js-yaml';

import { helpers } from '../../../common/helpers';
import OperatorEditorSubPage from '../OperatorEditorSubPage';
import YamlViewer from '../../../components/YamlViewer';
import { getValueError, getDefaultDeployment, isDeploymentDefault } from '../../../utils/operatorUtils';
import { operatorFieldValidators } from '../../../utils/operatorValidators';
import {
  storeEditorFormErrorsAction,
  storeEditorOperatorAction,
  setSectionStatusAction
} from '../../../redux/actions/editorActions';
import { sectionsFields, EDITOR_STATUS } from '../../../utils/constants';

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

  deploymentIndex;

  constructor(props) {
    super(props);

    this.deploymentIndex = parseInt(_.get(props.match, 'params.index'), 10);
  }

  componentDidMount() {
    const { operator, isNew } = this.props;
    const operatorDeployments = _.get(operator, deploymentFields, []);

    let deployment = operatorDeployments[this.deploymentIndex];

    if (isNew) {
      deployment = getDefaultDeployment();

      // set again correct index
      this.deploymentIndex = operatorDeployments.length;
      this.updateOperator(deployment);
    }

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

  updateOperator = updatedDeployment => {
    const { operator, storeEditorOperator } = this.props;

    const updatedOperator = _.cloneDeep(operator);
    const deployments = _.get(updatedOperator, deploymentFields);

    const updatedDeployments = [
      ...deployments.slice(0, this.deploymentIndex),
      updatedDeployment,
      ...deployments.slice(this.deploymentIndex + 1)
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
    const { setSectionStatus } = this.props;

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

    setSectionStatus(EDITOR_STATUS.pending);
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
  setSectionStatus: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired,
  isNew: PropTypes.bool
};

OperatorDeploymentEditPage.defaultProps = {
  operator: {},
  isNew: false,
  storeEditorOperator: helpers.noop,
  setSectionStatus: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      storeEditorOperator: storeEditorOperatorAction,
      storeEditorFormErrors: storeEditorFormErrorsAction,
      setSectionStatus: status => setSectionStatusAction('deployments', status)
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
