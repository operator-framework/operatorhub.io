import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import { renderFormError, sectionsFields } from './bundlePageUtils';
import {
  operatorFieldDescriptions,
  operatorFieldPlaceholders,
  operatorFieldValidators,
  operatorObjectDescriptions
} from '../../utils/operatorDescriptors';
import RulesEditor from '../../components/editor/RulesEditor';

const permissionFields = sectionsFields.permissions;

class OperatorPermissionsEditPage extends React.Component {
  state = {
    permission: {}
  };

  componentDidMount() {
    const { operator, field, objectType, storeEditorOperator } = this.props;
    const name = helpers.transformPathedName(_.get(this.props.match, 'params.serviceAccountName', ''));

    let permissions = _.get(operator, field);

    let permission = _.find(permissions, { serviceAccountName: name });

    if (!permission) {
      permission = { serviceAccountName: `Add ${objectType}` };
      if (!_.size(permissions)) {
        permissions = [];
      }

      permissions.push(permission);
      const updatedOperator = _.cloneDeep(operator);
      _.set(updatedOperator, field, permissions);
      storeEditorOperator(updatedOperator);
    }
    this.setState({ permission });

    if (permission.serviceAccountName === `Add ${objectType}`) {
      setTimeout(() => {
        this.nameInput.focus();
        this.nameInput.select();
      }, 100);
    }
  }

  updatePermission = (value, permissionField) => {
    const { operator, field, storeEditorOperator } = this.props;
    const { permission } = this.state;

    const permissions = _.get(operator, field, []);
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

    this.setState({ permission: updatedPermission });
    storeEditorOperator(updatedOperator);
  };

  updateRules = rules => {
    this.updatePermission(rules, 'rules');
  };

  renderNameField = () => {
    const { field, formErrors } = this.props;
    const { permission } = this.state;

    const errs = _.get(permission, 'serviceAccountName') === undefined ? {} : formErrors;

    const formFieldClasses = classNames({
      'oh-operator-editor-form__field': true,
      row: true,
      'oh-operator-editor-form__field--error': _.get(formErrors, [...field.split('.'), 'serviceAccountName'])
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
            onChange={e => this.updatePermission(e.target.value, 'serviceAccountName')}
            value={_.get(permission, 'serviceAccountName', '')}
            placeholder={_.get(operatorFieldPlaceholders, [...field.split('.'), 'serviceAccountName'])}
            ref={ref => {
              this.nameInput = ref;
            }}
          />
          {renderFormError([field, 'serviceAccountName'], errs)}
        </div>
        <div className="oh-operator-editor-form__description col-sm-6">
          {_.get(operatorFieldDescriptions, [...field.split('.'), 'serviceAccountName'], '')}
        </div>
      </div>
    );
  };

  render() {
    const { field, objectType, objectPage, objectsTitle, objectDescription, history } = this.props;
    const { permission } = this.state;

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
          {this.renderNameField('Service Account Name', 'serviceAccountName', 'text')}
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
  storeEditorOperator: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  storeEditorOperator: operator =>
    dispatch({
      type: reduxConstants.SET_EDITOR_OPERATOR,
      operator
    }),
  storeEditorFormErrors: formErrors =>
    dispatch({
      type: reduxConstants.SET_EDITOR_FORM_ERRORS,
      formErrors
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorPermissionsEditPage);
