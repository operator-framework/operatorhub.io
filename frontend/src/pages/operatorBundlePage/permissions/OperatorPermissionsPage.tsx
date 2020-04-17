import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash-es';

import { noop } from '../../../common/helpers';
import OperatorEditorSubPage from '../subPage/OperatorEditorSubPage';
import ListObjectEditor from '../../../components/editor/ListObjectEditor';
import { getFieldValueError, containsErrors } from '../../../utils/operatorValidation';
import { operatorObjectDescriptions } from '../../../utils/operatorDescriptors';
import { getUpdatedFormErrors, getVersionEditorRootPath } from '../bundlePageUtils';
import {
  storeEditorFormErrorsAction,
  storeEditorOperatorAction,
  setSectionStatusAction
} from '../../../redux/actions/editorActions';
import { sectionsFields, EDITOR_STATUS, VersionEditorParamsMatch } from '../../../utils/constants';
import { StoreState } from '../../../redux';
import { History } from 'history';

const permissionFields = sectionsFields.permissions;

const OperatorPermissionsPageActions = {
  storeEditorOperator: storeEditorOperatorAction,
  storeEditorFormErrors: storeEditorFormErrorsAction,
  setSectionStatus: setSectionStatusAction
};

export type OperatorPermissionsPageProps = {
  history: History,
  match: VersionEditorParamsMatch,
  field?: string,
  title?: string,
  section?: string,
  objectType?: string,
  objectPage?: string,

} & ReturnType<typeof mapStateToProps> & typeof OperatorPermissionsPageActions;

class OperatorPermissionsPage extends React.PureComponent<OperatorPermissionsPageProps> {

  static propTypes;
  static defaultProps;

  componentDidMount() {
    const { operator, sectionStatus, objectPage = 'permissions' } = this.props;

    if (operator && sectionStatus[objectPage] !== EDITOR_STATUS.empty) {
      // validate
      this.validateField(operator);
    }
  }

  updateOperator = permissions => {
    const { storeEditorOperator, operator, field = permissionFields } = this.props;

    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, field, permissions);
    storeEditorOperator(updatedOperator);
    this.validateField(updatedOperator, true);
  };

  validateField = (operator, modified?) => {
    const { field = permissionFields, formErrors, storeEditorFormErrors, objectPage = 'permissions', sectionStatus, setSectionStatus } = this.props;

    const status = sectionStatus[objectPage];
    const error = getFieldValueError(operator, field);
    _.set(formErrors, field, error);
    storeEditorFormErrors(formErrors);

    // mark errored or remove error
    // do not automatically change status of done or empty status
    // that requires user action
    if (error) {
      setSectionStatus(objectPage as any, EDITOR_STATUS.errors);
    } else if (modified) {
      setSectionStatus(objectPage as any, EDITOR_STATUS.modified);
    } else if (status === EDITOR_STATUS.errors) {
      setSectionStatus(objectPage as any, EDITOR_STATUS.all_good);
    }
  };

  validatePage = () => {
    const { operator, objectPage = 'permissions', formErrors, setSectionStatus, storeEditorFormErrors } = this.props;

    const fields = [sectionsFields[objectPage]];
    const errors = getUpdatedFormErrors(operator, formErrors, fields);
    const hasErrors = fields.some(field => _.get(errors, field));

    if (hasErrors) {
      setSectionStatus(objectPage as any, EDITOR_STATUS.errors);
      storeEditorFormErrors(errors);

      return false;
    }

    return true;
  };

  render() {
    const {
      operator,
      field = permissionFields,
      title = 'Permissions',
      section,
      objectPage = 'permissions',
      objectType = 'Permission',
      formErrors,
      history,
      sectionStatus,
      match
    } = this.props;

    const errors = _.get(formErrors, field);
    const pageHasErrors = sectionStatus[objectPage] === EDITOR_STATUS.empty || containsErrors(errors);
    const sectionPath = `${getVersionEditorRootPath(match)}/${objectPage}`;

    return (
      <OperatorEditorSubPage
        title={title}
        field={field}
        description={_.get(operatorObjectDescriptions, [...field.split('.'), 'description'])}
        versionEditorRootPath={getVersionEditorRootPath(match)}
        secondary
        history={history}
        match={match}
        section={section as any}
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
          sectionPath={sectionPath}
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
  history: PropTypes.any.isRequired,
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
  setSectionStatus: PropTypes.func
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
  storeEditorFormErrors: noop,
  storeEditorOperator: noop,
  setSectionStatus: noop
};

const mapDispatchToProps = dispatch => bindActionCreators(OperatorPermissionsPageActions, dispatch);

const mapStateToProps = (state: StoreState) => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors,
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorPermissionsPage);
