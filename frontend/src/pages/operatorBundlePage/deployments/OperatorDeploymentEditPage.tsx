import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { safeDump, safeLoad, Type } from 'js-yaml';
import { History } from 'history';

import { noop } from '../../../common/helpers';
import OperatorEditorSubPage from '../subPage/OperatorEditorSubPage';
import YamlViewer from '../../../components/YamlViewer';
import { getDefaultDeployment, isDeploymentDefault } from '../../../utils/operatorUtils';
import { getValueError } from '../../../utils/operatorValidation';
import { operatorFieldValidators } from '../../../utils/operatorValidators';
import {
  storeEditorFormErrorsAction,
  storeEditorOperatorAction,
  setSectionStatusAction
} from '../../../redux/actions/editorActions';
import { sectionsFields, EDITOR_STATUS, VersionEditorParamsMatch } from '../../../utils/constants';
import { StoreState } from '../../../redux';
import { getVersionEditorRootPath } from '../bundlePageUtils';

const deploymentFields = sectionsFields.deployments;

const OperatorDeploymentEditPageActions = {
  storeEditorOperator: storeEditorOperatorAction,
  storeEditorFormErrors: storeEditorFormErrorsAction,
  setSectionStatus: status => setSectionStatusAction('deployments', status)
};

export type OperatorDeploymentEditPageProps = {
  isNew: boolean,
  history: History,
  match: VersionEditorParamsMatch
} & ReturnType<typeof mapStateToProps> & typeof OperatorDeploymentEditPageActions;

interface OperatorDeploymentEditPageState {
  deploymentYaml: string
  yamlError?: string | React.ReactNode[]
}

class OperatorDeploymentEditPage extends React.PureComponent<OperatorDeploymentEditPageProps, OperatorDeploymentEditPageState> {


  static propTypes;
  static defaultProps;

  state: OperatorDeploymentEditPageState = {
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
    let yamlError: string | React.ReactNode[] | undefined = '';
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

    const errsText: React.ReactNode[] = [];

    errs.forEach((err, index) => {
      index > 0 && errsText.push(<br key={index} />);
      errsText.push(<span key={index}>{err}</span>);
    });

    return errsText.length > 0 ? errsText : undefined;
  };

  onYamlChange = yaml => {
    const { setSectionStatus } = this.props;

    let yamlError: string | React.ReactNode[] | undefined  = '';

    try {
      const updatedDeployment = safeLoad(yaml);
      yamlError = this.validateDeployment(updatedDeployment);

      this.updateOperator(updatedDeployment);
    } catch (e) {
      yamlError = e.message;
    }
    this.setState({ yamlError });

    setSectionStatus(EDITOR_STATUS.modified);
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
    const { history, match } = this.props;
    const { deploymentYaml, yamlError } = this.state;
    return (
      <OperatorEditorSubPage
        title="Edit Deployment"
        field={deploymentFields}
        tertiary
        lastPage="deployments"
        lastPageTitle="Deployments"
        history={history}
        match={match}
        versionEditorRootPath={getVersionEditorRootPath(match)}
        validatePage={() => true}
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
  storeEditorOperator: noop,
  setSectionStatus: noop
};

const mapDispatchToProps = dispatch => bindActionCreators(OperatorDeploymentEditPageActions, dispatch);

const mapStateToProps = (state: StoreState) => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorDeploymentEditPage);
