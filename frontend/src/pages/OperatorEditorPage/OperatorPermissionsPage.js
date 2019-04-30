import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import ListObjectEditor from '../../components/editor/ListObjectEditor';
import { getFieldValueError } from '../../utils/operatorUtils';
import { operatorObjectDescriptions } from '../../utils/operatorDescriptors';

const OperatorPermissionsPage = ({
  operator,
  field,
  title,
  section,
  objectPage,
  objectType,
  formErrors,
  storeEditorOperator,
  storeEditorFormErrors,
  history
}) => {
  const updateOperator = permissions => {
    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, field, permissions);
    storeEditorOperator(updatedOperator);
    validateField();
  };

  const validateField = () => {
    const error = getFieldValueError(operator, field);
    _.set(formErrors, field, error);
    storeEditorFormErrors(formErrors);
  };

  return (
    <OperatorEditorSubPage
      title={title}
      field={field}
      description={_.get(operatorObjectDescriptions, [...field.split('.'), 'description'])}
      secondary
      history={history}
      section={section}
    >
      <ListObjectEditor
        operator={operator}
        formErrors={formErrors}
        title={title}
        onUpdate={updateOperator}
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
};

OperatorPermissionsPage.propTypes = {
  operator: PropTypes.object,
  field: PropTypes.string,
  title: PropTypes.string,
  section: PropTypes.string,
  objectType: PropTypes.string,
  objectPage: PropTypes.string,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorPermissionsPage.defaultProps = {
  operator: {},
  field: 'spec.install.spec.permissions',
  title: 'Permissions',
  section: 'permissions',
  objectType: 'Permission',
  objectPage: 'permissions',
  formErrors: {},
  storeEditorFormErrors: helpers.noop,
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
)(OperatorPermissionsPage);
