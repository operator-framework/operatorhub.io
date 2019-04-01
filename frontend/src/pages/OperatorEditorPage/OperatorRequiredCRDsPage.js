import * as React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import * as _ from 'lodash-es';
import { Breadcrumb } from 'patternfly-react';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import { operatorFieldDescriptions } from '../../utils/operatorDescriptors';
import OperatorEditorSubPage from './OperatorEditorSubPage';

const OperatorRequiredCRDsPage = ({ operator, formErrors, storeEditorOperator, storeEditorFormErrors, history }) => {
  const onHome = e => {
    e.preventDefault();
    history.push('/');
  };

  const onBack = e => {
    e.preventDefault();
    history.push('/editor');
  };

  const renderHeader = () => (
    <React.Fragment>
      <h1>Required CRDs (Optional)</h1>
      <p>{_.get(operatorFieldDescriptions, 'spec.customresourcedefinitions.required')}</p>
    </React.Fragment>
  );

  const breadcrumbs = (
    <Breadcrumb>
      <Breadcrumb.Item onClick={e => onHome(e)} href={window.location.origin}>
        Home
      </Breadcrumb.Item>
      <Breadcrumb.Item onClick={e => onBack(e)} href={`${window.location.origin}/Operator Editor`}>
        Operator Editor
      </Breadcrumb.Item>
      <Breadcrumb.Item active>Required CRDs</Breadcrumb.Item>
    </Breadcrumb>
  );

  return (
    <OperatorEditorSubPage breadcrumbs={breadcrumbs} header={renderHeader()} history={history}>
      TBD
    </OperatorEditorSubPage>
  );
};

OperatorRequiredCRDsPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorRequiredCRDsPage.defaultProps = {
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
)(OperatorRequiredCRDsPage);
