import * as React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import ListObjectEditor from '../../components/editor/ListObjectEditor';
import { getFieldValueError } from '../../utils/operatorUtils';
import { operatorObjectDescriptions } from '../../utils/operatorDescriptors';
import { storeEditorFormErrorsAction, storeEditorOperatorAction } from '../../redux/actions/editorActions';

const OperatorCRDsPage = ({
  operator,
  crdsField,
  crdsTitle,
  crdsDescription,
  objectPage,
  objectType,
  formErrors,
  storeEditorOperator,
  storeEditorFormErrors,
  history
}) => {
  const validateField = field => {
    const error = getFieldValueError(operator, field);
    _.set(formErrors, field, error);
    storeEditorFormErrors(formErrors);
  };

  const updateOperator = crds => {
    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, crdsField, crds);
    storeEditorOperator(updatedOperator);
    validateField(crdsField);
  };

  const description = (
    <span>
      <p>{_.get(operatorObjectDescriptions, [...crdsField.split('.'), 'description'])}</p>
      <p>{crdsDescription}</p>
    </span>
  );

  return (
    <OperatorEditorSubPage title={crdsTitle} description={description} secondary history={history} section={objectPage}>
      <ListObjectEditor
        operator={operator}
        title={crdsTitle}
        onUpdate={updateOperator}
        field={crdsField}
        fieldTitle="Display Name"
        objectPage={objectPage}
        formErrors={formErrors}
        history={history}
        objectTitleField="displayName"
        pagePathField="name"
        objectType={objectType}
        addName="new-crd"
      />
    </OperatorEditorSubPage>
  );
};

OperatorCRDsPage.propTypes = {
  operator: PropTypes.object,
  crdsField: PropTypes.string.isRequired,
  crdsTitle: PropTypes.string.isRequired,
  crdsDescription: PropTypes.node.isRequired,
  objectPage: PropTypes.string.isRequired,
  objectType: PropTypes.string.isRequired,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorCRDsPage.defaultProps = {
  operator: {},
  formErrors: {},
  storeEditorFormErrors: helpers.noop,
  storeEditorOperator: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      storeEditorOperator: storeEditorOperatorAction,
      storeEditorFormErrors: storeEditorFormErrorsAction
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
)(OperatorCRDsPage);
