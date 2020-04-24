import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash-es';

import { noop } from '../../../common/helpers';
import OperatorEditorSubPage from '../subPage/OperatorEditorSubPage';
import { getUpdatedFormErrors, getVersionEditorRootPath } from '../bundlePageUtils';
import { operatorObjectDescriptions, operatorFieldDescriptions } from '../../../utils/operatorDescriptors';
import RulesEditor from '../../../components/editor/RulesEditor';
import {
  storeEditorFormErrorsAction,
  storeEditorOperatorAction,
  setSectionStatusAction
} from '../../../redux/actions/editorActions';
import OperatorInputUncontrolled from '../../../components/editor/forms/OperatorInputUncontrolled';
import { sectionsFields, EDITOR_STATUS, VersionEditorParamsMatch } from '../../../utils/constants';
import { StoreState } from '../../../redux';
import { History } from 'history';

const permissionFields = sectionsFields.permissions;
const descriptions = _.get(operatorFieldDescriptions, permissionFields);

const OperatorPermissionsEditPageActions = {
  storeEditorOperator: storeEditorOperatorAction,
  storeEditorFormErrors: storeEditorFormErrorsAction,
  setSectionStatus: setSectionStatusAction
}

export type OperatorPermissionsEditPageProps = {
  isNew: boolean,
  history: History,
  match: VersionEditorParamsMatch,
  field?: string,
  objectType?: string,
  objectsTitle?: string,
  objectPage?: string,
  objectDescription?: React.ReactNode,
} & ReturnType<typeof mapStateToProps> & typeof OperatorPermissionsEditPageActions;

class OperatorPermissionsEditPage extends React.PureComponent<OperatorPermissionsEditPageProps> {

  static propTypes;
  static defaultProps;

  name;

  nameInput;

  permissionIndex;

  isNewPermission;

  constructor(props) {
    super(props);

    this.permissionIndex = parseInt(_.get(props.match, 'params.index'), 10);
  }

  componentDidMount() {
    const { objectType, operator, field = permissionFields, storeEditorOperator, isNew } = this.props;

    const permissions = _.get(operator, field) || [];

    this.isNewPermission = isNew;

    let permission = permissions[this.permissionIndex];

    if (this.isNewPermission) {
      permission = {
        serviceAccountName: `Add ${objectType}`
      };

      this.permissionIndex = permissions.length;

      const updatePermissions = _.cloneDeep(permissions);
      updatePermissions.push(permission);

      const updatedOperator = _.cloneDeep(operator);
      _.set(updatedOperator, field, updatePermissions);

      storeEditorOperator(updatedOperator);
    } else {
      this.validateField(operator);
    }

    if (permission.serviceAccountName === `Add ${objectType}`) {
      setTimeout(() => {
        this.nameInput.focus();
        this.nameInput.select();
      }, 100);
    }
  }

  getErrors = () => {
    const { field = permissionFields, formErrors } = this.props;

    const errors = _.find(_.get(formErrors, field), { index: this.permissionIndex }) || { errors: {} };
    return errors.errors;
  };

  updatePermission = (permissionField, value) => {
    const { operator, field = permissionFields, storeEditorOperator } = this.props;

    const permissions = _.get(operator, field) || [];
    // get permission or supply new value
    const permission = permissions[this.permissionIndex];

    const updatedPermission = _.cloneDeep(permission);
    _.set(updatedPermission, permissionField, value);

    const updatedOperator = _.cloneDeep(operator);

    const updatedPermissions = [
      ...permissions.slice(0, this.permissionIndex),
      updatedPermission,
      ...permissions.slice(this.permissionIndex + 1)
    ];
    _.set(updatedOperator, field, updatedPermissions);

    this.validateField(updatedOperator, true);

    storeEditorOperator(updatedOperator);
  };

  validateField = (updatedOperator, modified?) => {
    const { sectionStatus, field = permissionFields, formErrors, storeEditorFormErrors, setSectionStatus, objectPage = 'permissions' } = this.props;

    const status = sectionStatus[objectPage];
    const errors = getUpdatedFormErrors(updatedOperator, formErrors, field);
    storeEditorFormErrors(errors);
    const permissionErrors = _.get(errors, field);

    if (permissionErrors) {
      setSectionStatus(objectPage as any, EDITOR_STATUS.errors);
    } else if (modified) {
      setSectionStatus(objectPage as any, EDITOR_STATUS.modified);
    } else if (status === EDITOR_STATUS.errors) {
      setSectionStatus(objectPage as any, EDITOR_STATUS.all_good);
    }
  };

  updateRules = rules => {
    this.updatePermission('rules', rules);
  };

  render() {
    const {
      match,
      operator,
      field = permissionFields,
      objectType,
      objectPage,
      objectsTitle,
      objectDescription,
      history
    } = this.props;
    const errors = this.getErrors();
    const permissions = _.get(operator, field, []);
    const permission = permissions[this.permissionIndex];

    return (
      <OperatorEditorSubPage
        title={`Edit ${objectType}`}
        field={field}
        description={_.get(operatorObjectDescriptions, [...field.split('.'), 'description'])}
        tertiary
        lastPage={objectPage}
        lastPageTitle={objectsTitle}
        history={history}
        match={match}
        versionEditorRootPath={getVersionEditorRootPath(match)}
        validatePage={() => true}
      >
        <h3>{objectsTitle}</h3>
        <p>{objectDescription}</p>
        <form className="oh-operator-editor-form">
          <OperatorInputUncontrolled
            title="Service Account Name"
            field="serviceAccountName"
            inputType="text"
            formErrors={errors}
            defaultValue={_.get(permission, 'serviceAccountName', '')}
            commitField={this.updatePermission}
            refCallback={ref => {
              this.nameInput = ref;
            }}
            descriptions={descriptions}
          />
          <h3>Rules</h3>
          <RulesEditor permission={permission} onUpdate={this.updateRules} />
        </form>
      </OperatorEditorSubPage>
    );
  }
}

OperatorPermissionsEditPage.propTypes = {
  operator: PropTypes.object,
  field: PropTypes.string,
  objectType: PropTypes.string,
  objectsTitle: PropTypes.string,
  objectPage: PropTypes.string,
  objectDescription: PropTypes.node,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  setSectionStatus: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired,
  isNew: PropTypes.bool
};

OperatorPermissionsEditPage.defaultProps = {
  operator: {},
  field: permissionFields,
  objectType: 'Permission',
  objectsTitle: 'Permissions',
  objectPage: 'permissions',
  objectDescription: (
    <span>
      Multiple Roles should e described to reduce the scope of any actions needed containers that the Operator may run
      on the cluster. For example, if you have a component that generates a TLS Secret upon start up, a Role that allows{' '}
      <code>create</code> but not <code>list</code> on Secrets is more secure that using a single all-powerful Service
      Account.
    </span>
  ),
  formErrors: {},
  isNew: false,
  storeEditorOperator: noop,
  setSectionStatus: noop,
  storeEditorFormErrors: noop
};

const mapDispatchToProps = dispatch => bindActionCreators(OperatorPermissionsEditPageActions, dispatch);

const mapStateToProps = (state: StoreState) => ({
  operator: state.editorState.operator,
  sectionStatus: state.editorState.sectionStatus,
  formErrors: state.editorState.formErrors
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorPermissionsEditPage);
