import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import { renderFormError, sectionsFields, getUpdatedFormErrors, EDITOR_STATUS } from './bundlePageUtils';
import {
  operatorFieldDescriptions,
  operatorFieldPlaceholders,
  operatorFieldValidators,
  operatorObjectDescriptions
} from '../../utils/operatorDescriptors';
import RulesEditor from '../../components/editor/RulesEditor';
import {
  storeEditorFormErrorsAction,
  storeEditorOperatorAction,
  setSectionStatusAction
} from '../../redux/actions/editorActions';

const permissionFields = sectionsFields.permissions;

class OperatorPermissionsEditPage extends React.Component {
  name;

  nameInput;

  permissionIndex;

  constructor(props) {
    super(props);

    this.name = helpers.transformPathedName(_.get(props.match, 'params.serviceAccountName', '').replace('[none]', ''));
  }

  componentDidMount() {
    const { objectType } = this.props;

    const permission = this.getPermission();

    if (!permission) {
      this.updatePermission(`Add ${objectType}`, 'serviceAccountName');
    }

    if (permission.serviceAccountName === `Add ${objectType}`) {
      setTimeout(() => {
        this.nameInput.focus();
        this.nameInput.select();
      }, 100);
    }
  }

  /**
   * Find permission by serviceAccountName or provide new empty permission
   */
  getPermission = () => {
    const { operator, field, objectType } = this.props;

    const permissions = _.get(operator, field) || [];
    const permission = _.find(permissions, { serviceAccountName: this.name }) || {
      serviceAccountName: `Add ${objectType}`
    };

    return permission;
  };

  getErrors = () => {
    const { operator, field, formErrors } = this.props;

    const permissions = _.get(operator, field) || [];
    const permission = this.getPermission();
    const permissionIndex = _.findIndex(permissions, { serviceAccountName: permission.serviceAccountName });

    const errors = _.find(_.get(formErrors, field), { index: permissionIndex }) || { errors: {} };
    return errors.errors;
  };

  updatePermission = (value, permissionField) => {
    const { operator, field, storeEditorOperator } = this.props;

    const permissions = _.get(operator, field) || [];
    // get permission or supply new value
    const permission = this.getPermission();

    const permissionIndex = _.findIndex(permissions, { serviceAccountName: permission.serviceAccountName });

    const updatedPermission = _.cloneDeep(permission);
    _.set(updatedPermission, permissionField, value);

    const updatedOperator = _.cloneDeep(operator);

    const updatedPermissions = [
      ...permissions.slice(0, permissionIndex),
      updatedPermission,
      ...permissions.slice(permissionIndex + 1)
    ];
    _.set(updatedOperator, field, updatedPermissions);

    // update name in case it changed
    this.name = updatedPermission.serviceAccountName;

    this.validateField(updatedOperator);

    storeEditorOperator(updatedOperator);
  };

  validateField = updatedOperator => {
    const { field, formErrors, storeEditorFormErrors, setSectionStatus, objectPage } = this.props;

    const errors = getUpdatedFormErrors(updatedOperator, formErrors, field);
    storeEditorFormErrors(errors);
    const permissionErrors = _.get(errors, field);

    if (permissionErrors) {
      setSectionStatus(objectPage, EDITOR_STATUS.errors);
    } else {
      setSectionStatus(objectPage, EDITOR_STATUS.pending);
    }
  };

  updateRules = rules => {
    this.updatePermission(rules, 'rules');
  };

  renderNameField = permission => {
    const { field } = this.props;

    const serviceAccountNamePath = [...field.split('.'), 'serviceAccountName'];
    const errors = this.getErrors();

    const formFieldClasses = classNames({
      'oh-operator-editor-form__field': true,
      row: true,
      'oh-operator-editor-form__field--error': _.get(errors, 'serviceAccountName')
    });

    return (
      <div className={formFieldClasses}>
        <div className="form-group col-sm-6">
          <label htmlFor={field}>Service Account Name</label>
          <input
            id={field}
            className="form-control"
            type="text"
            {..._.get(_.get(operatorFieldValidators, field), 'props')}
            onBlur={e => this.updatePermission(e.target.value, 'serviceAccountName')}
            defaultValue={_.get(permission, 'serviceAccountName', '')}
            placeholder={_.get(operatorFieldPlaceholders, serviceAccountNamePath)}
            ref={ref => {
              this.nameInput = ref;
            }}
          />
          {renderFormError('serviceAccountName', errors)}
        </div>
        <div className="oh-operator-editor-form__description col-sm-6">
          {_.get(operatorFieldDescriptions, serviceAccountNamePath, '')}
        </div>
      </div>
    );
  };

  render() {
    const { field, objectType, objectPage, objectsTitle, objectDescription, history } = this.props;

    const permission = this.getPermission();

    return (
      <OperatorEditorSubPage
        title={`Edit ${objectType}`}
        field={field}
        description={_.get(operatorObjectDescriptions, [...field.split('.'), 'description'])}
        tertiary
        lastPage={objectPage}
        lastPageTitle={objectsTitle}
        history={history}
      >
        <h3>{objectsTitle}</h3>
        <p>{objectDescription}</p>
        <form className="oh-operator-editor-form">
          {this.renderNameField(permission)}
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
  match: PropTypes.object.isRequired
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
  storeEditorOperator: helpers.noop,
  setSectionStatus: helpers.noop,
  storeEditorFormErrors: helpers.noop
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
  formErrors: state.editorState.formErrors
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorPermissionsEditPage);
