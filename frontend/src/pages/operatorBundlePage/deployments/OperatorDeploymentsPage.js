import * as React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../../common/helpers';
import { getFieldValueError, containsErrors } from '../../../utils/operatorUtils';
import OperatorEditorSubPage from '../OperatorEditorSubPage';
import ListObjectEditor from '../../../components/editor/ListObjectEditor';
import { getUpdatedFormErrors } from '../bundlePageUtils';

import {
  storeEditorFormErrorsAction,
  storeEditorOperatorAction,
  setSectionStatusAction
} from '../../../redux/actions/editorActions';
import { sectionsFields, EDITOR_STATUS } from '../../../utils/constants';

const deploymentFields = sectionsFields.deployments;

class OperatorDeploymentsPage extends React.Component {
  componentDidMount() {
    const { operator, sectionStatus } = this.props;

    if (operator && sectionStatus.deployments !== EDITOR_STATUS.empty) {
      // validate
      this.validateField(operator);
    }
  }

  validateField = operator => {
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
    } else if (status === EDITOR_STATUS.errors) {
      setSectionStatus(EDITOR_STATUS.pending);
    }
  };

  updateOperator = deployments => {
    const { operator, storeEditorOperator } = this.props;

    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, deploymentFields, deployments);

    storeEditorOperator(updatedOperator);
    this.validateField(updatedOperator);
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
    const { operator, formErrors, history, sectionStatus } = this.props;

    const errors = _.get(formErrors, deploymentFields);
    const pageHasErrors = sectionStatus.deplyments === EDITOR_STATUS.empty || containsErrors(errors);

    return (
      <OperatorEditorSubPage
        title="Deployments"
        field={deploymentFields}
        secondary
        history={history}
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
          objectPage="deployments"
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
  storeEditorFormErrors: helpers.noop,
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
  formErrors: state.editorState.formErrors,
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorDeploymentsPage);
