import * as React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import { getFieldValueError } from '../../utils/operatorUtils';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import ListObjectEditor from '../../components/editor/ListObjectEditor';
import { sectionsFields } from './bundlePageUtils';
import { storeEditorFormErrorsAction, storeEditorOperatorAction } from '../../redux/actions/editorActions';

const deploymentFields = sectionsFields.deployments;

class OperatorDeploymentsPage extends React.Component {
  componentDidMount() {
    const { operator } = this.props;

    if (operator) {
      // validate
      this.validateField(operator, deploymentFields);
    }
  }

  validateField = (operator, field) => {
    const { formErrors, storeEditorFormErrors } = this.props;

    const error = getFieldValueError(operator, field);
    _.set(formErrors, field, error);
    storeEditorFormErrors(formErrors);
  };

  updateOperator = deployments => {
    const { operator, storeEditorOperator } = this.props;

    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, deploymentFields, deployments);

    storeEditorOperator(updatedOperator);
    this.validateField(updatedOperator, deploymentFields);
  };

  render() {
    const { operator, formErrors, history } = this.props;

    return (
      <OperatorEditorSubPage
        title="Deployments"
        field={deploymentFields}
        secondary
        history={history}
        section="deployments"
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
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorDeploymentsPage.defaultProps = {
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
)(OperatorDeploymentsPage);
