import * as React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../../common';
import OperatorEditorSubPage from '../OperatorEditorSubPage';
import ListObjectEditor from '../../../components/editor/ListObjectEditor';
import { getFieldValueError, containsErrors } from '../../../utils/operatorUtils';
import { operatorObjectDescriptions } from '../../../utils/operatorDescriptors';
import { getUpdatedFormErrors } from '../bundlePageUtils';
import {
  storeEditorFormErrorsAction,
  storeEditorOperatorAction,
  setSectionStatusAction
} from '../../../redux/actions/editorActions';
import { sectionsFields, EDITOR_STATUS } from '../../../utils/constants';

const permissionFields = sectionsFields.permissions;

class OperatorPermissionsPage extends React.Component {
  componentDidMount() {
    const { operator, sectionStatus, objectPage } = this.props;

    if (operator && sectionStatus[objectPage] !== EDITOR_STATUS.empty) {
      // validate
      this.validateField(operator);
    }
  }

  updateOperator = permissions => {
    const { storeEditorOperator, operator, field } = this.props;

    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, field, permissions);
    storeEditorOperator(updatedOperator);
    this.validateField(updatedOperator);
  };

  validateField = operator => {
    const { field, formErrors, storeEditorFormErrors, objectPage, sectionStatus, setSectionStatus } = this.props;

    const status = sectionStatus[objectPage];
    const error = getFieldValueError(operator, field);
    _.set(formErrors, field, error);
    storeEditorFormErrors(formErrors);

    // mark errored or remove error
    // do not automatically change status of done or empty status
    // that requires user action
    if (error) {
      setSectionStatus(objectPage, EDITOR_STATUS.errors);
    } else if (status === EDITOR_STATUS.errors) {
      setSectionStatus(objectPage, EDITOR_STATUS.pending);
    }
  };

  validatePage = () => {
    const { operator, objectPage, formErrors, setSectionStatus, storeEditorFormErrors } = this.props;

    const fields = [sectionsFields[objectPage]];
    const errors = getUpdatedFormErrors(operator, formErrors, fields);
    const hasErrors = fields.some(field => _.get(errors, field));

    if (hasErrors) {
      setSectionStatus(objectPage, EDITOR_STATUS.errors);
      storeEditorFormErrors(errors);

      return false;
    }

    return true;
  };

  render() {
    const { operator, field, title, section, objectPage, objectType, formErrors, history, sectionStatus } = this.props;

    const errors = _.get(formErrors, field);
    const pageHasErrors = sectionStatus[objectPage] === EDITOR_STATUS.empty || containsErrors(errors);

    return (
      <OperatorEditorSubPage
        title={title}
        field={field}
        description={_.get(operatorObjectDescriptions, [...field.split('.'), 'description'])}
        secondary
        history={history}
        section={section}
        validatePage={this.validatePage}
        pageErrors={pageHasErrors}
      >
        <ListObjectEditor
          operator={operator}
          formErrors={formErrors}
          title={title}
          onUpdate={this.updateOperator}
          field={field}
          fieldTitle="Service Account Name"
          objectPage={objectPage}
          objectType={objectType}
          history={history}
          objectTitleField="serviceAccountName"
          pagePathField="serviceAccountName"
        />
      </OperatorEditorSubPage>
    );
  }
}

OperatorPermissionsPage.propTypes = {
  operator: PropTypes.object,
  field: PropTypes.string,
  title: PropTypes.string,
  section: PropTypes.string,
  objectType: PropTypes.string,
  objectPage: PropTypes.string,
  formErrors: PropTypes.object,
  sectionStatus: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  setSectionStatus: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorPermissionsPage.defaultProps = {
  operator: {},
  field: permissionFields,
  title: 'Permissions',
  section: 'permissions',
  objectType: 'Permission',
  objectPage: 'permissions',
  sectionStatus: {},
  formErrors: {},
  storeEditorFormErrors: helpers.noop,
  storeEditorOperator: helpers.noop,
  setSectionStatus: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      storeEditorOperator: storeEditorOperatorAction,
      storeEditorFormErrors: storeEditorFormErrorsAction,
      setSectionStatus: setSectionStatusAction
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
)(OperatorPermissionsPage);
