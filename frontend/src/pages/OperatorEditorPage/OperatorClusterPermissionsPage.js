import * as React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import OperatorEditorSubPage from './OperatorEditorSubPage';

const OperatorClusterPermissionsPage = ({
  operator,
  formErrors,
  storeEditorOperator,
  storeEditorFormErrors,
  history
}) => (
  <OperatorEditorSubPage
    title="Cluster Permissions"
    field="spec.install.spec.clusterPermissions"
    secondary
    history={history}
  >
    TBD
  </OperatorEditorSubPage>
);

OperatorClusterPermissionsPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorClusterPermissionsPage.defaultProps = {
  operator: {},
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
)(OperatorClusterPermissionsPage);
