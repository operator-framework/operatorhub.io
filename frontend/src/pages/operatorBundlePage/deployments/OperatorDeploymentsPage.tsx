import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { History } from 'history';

import { noop } from '../../../common/helpers';
import { getFieldValueError, containsErrors } from '../../../utils/operatorValidation';

import OperatorEditorSubPage from '../subPage/OperatorEditorSubPage';
import ListObjectEditor from '../../../components/editor/ListObjectEditor';
import { getUpdatedFormErrors, getVersionEditorRootPath } from '../bundlePageUtils';

import {
  storeEditorFormErrorsAction,
  storeEditorOperatorAction,
  setSectionStatusAction
} from '../../../redux/actions/editorActions';
import { sectionsFields, EDITOR_STATUS, VersionEditorParamsMatch } from '../../../utils/constants';
import { StoreState } from '../../../redux';

const deploymentFields = sectionsFields.deployments;

const OperatorDeploymentsPageActions = {
  storeEditorOperator: storeEditorOperatorAction,
  storeEditorFormErrors: storeEditorFormErrorsAction,
  setSectionStatus: status => setSectionStatusAction('deployments', status)
}

export type OperatorDeploymentsPageProps = {
  history: History,
  match: VersionEditorParamsMatch
} & ReturnType<typeof mapStateToProps> & typeof OperatorDeploymentsPageActions;

  class OperatorDeploymentsPage extends React.PureComponent <OperatorDeploymentsPageProps> {

    static propTypes;
    static defaultProps;

    originalStatus: any;

    componentDidMount() {
      const { operator, sectionStatus } = this.props;

      if (operator && sectionStatus.deployments !== EDITOR_STATUS.empty) {
        // validate
        this.validateField(operator);
      }
    }

  validateField = (operator, modified?) => {
      const { formErrors, storeEditorFormErrors, setSectionStatus, sectionStatus } = this.props;
      const updatedFormErrors = _.cloneDeep(formErrors);
      const status = sectionStatus.deployments;

      const error = getFieldValueError(operator, deploymentFields);
      _.set(updatedFormErrors, deploymentFields, error);
      storeEditorFormErrors(updatedFormErrors);

      // mark errored or remove error
      // do not automatically change status of done or empty status
      // that requires user action
      if (error) {
      setSectionStatus(EDITOR_STATUS.errors);
    } else if (modified){
      setSectionStatus(EDITOR_STATUS.modified);
    } else if (status === EDITOR_STATUS.errors) {
      setSectionStatus(EDITOR_STATUS.all_good);
    }
    };

    updateOperator = deployments => {
      const { operator, storeEditorOperator } = this.props;

      const updatedOperator = _.cloneDeep(operator);
      _.set(updatedOperator, deploymentFields, deployments);

      storeEditorOperator(updatedOperator);
      this.validateField(updatedOperator, true);
    };

    validatePage = () => {
      const { operator, formErrors, setSectionStatus, storeEditorFormErrors } = this.props;

      const fields = [sectionsFields.deployments];
      const errors = getUpdatedFormErrors(operator, formErrors, fields);
      const hasErrors = fields.some(field => _.get(errors, field));

      if (hasErrors) {
        this.originalStatus = EDITOR_STATUS.errors;
        setSectionStatus(EDITOR_STATUS.errors);
        storeEditorFormErrors(errors);

        return false;
      }

      return true;
    };

    render() {
      const { operator, formErrors, history, sectionStatus, match } = this.props;

      const errors = _.get(formErrors, deploymentFields);
      const pageHasErrors = sectionStatus.deployments === EDITOR_STATUS.empty || containsErrors(errors);
      const sectionPath = `${getVersionEditorRootPath(match)}/deployments`;

      return (
        <OperatorEditorSubPage
          title="Deployments"
          field={deploymentFields}
          versionEditorRootPath={getVersionEditorRootPath(match)}
          secondary
          history={history}
          match={match}
          section="deployments"
          validatePage={this.validatePage}
          pageErrors={pageHasErrors}
        >
          <ListObjectEditor
            operator={operator}
            title="Deployments"
            formErrors={formErrors}
            onUpdate={this.updateOperator}
            field={deploymentFields}
            fieldTitle="Name"
            sectionPath={sectionPath}
            history={history}
            objectTitleField="name"
            objectType="Deployment"
            addName="add-deployment"
          />
        </OperatorEditorSubPage>
      );
    }
  }

OperatorDeploymentsPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  sectionStatus: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  setSectionStatus: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorDeploymentsPage.defaultProps = {
  operator: {},
  formErrors: {},
  sectionStatus: {},
  storeEditorFormErrors: noop,
  storeEditorOperator: noop,
  setSectionStatus: noop
};

const mapDispatchToProps = dispatch => bindActionCreators(OperatorDeploymentsPageActions, dispatch);


const mapStateToProps = (state: StoreState) => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors,
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorDeploymentsPage);
