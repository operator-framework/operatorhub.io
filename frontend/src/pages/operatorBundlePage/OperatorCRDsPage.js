import * as React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import ListObjectEditor from '../../components/editor/ListObjectEditor';
import { getFieldValueError, convertExampleYamlToObj } from '../../utils/operatorUtils';
import { operatorObjectDescriptions } from '../../utils/operatorDescriptors';
import {
  storeEditorFormErrorsAction,
  storeEditorOperatorAction,
  setSectionStatusAction
} from '../../redux/actions/editorActions';
import { getUpdatedFormErrors, EDITOR_STATUS, sectionsFields } from './bundlePageUtils';

class OperatorCRDsPage extends React.Component {
  componentDidMount() {
    const { operator, sectionStatus, objectPage } = this.props;

    if (operator && sectionStatus[objectPage] !== EDITOR_STATUS.empty) {
      // validate
      this.validateField(operator);
    }
  }
  validateField = operator => {
    const { formErrors, storeEditorFormErrors, setSectionStatus, sectionStatus, objectPage, crdsField } = this.props;

    const error = getFieldValueError(operator, crdsField);
    const status = sectionStatus[objectPage];
    const updatedFormErrors = _.cloneDeep(formErrors);

    _.set(updatedFormErrors, crdsField, error);
    storeEditorFormErrors(updatedFormErrors);

    // mark errored or remove error
    // do not automatically change status of done or empty status
    // that requires user action
    if (error) {
      setSectionStatus(objectPage, EDITOR_STATUS.errors);
    } else if (status === EDITOR_STATUS.errors) {
      setSectionStatus(objectPage, EDITOR_STATUS.pending);
    }
  };

  updateOperator = (crds, removedCrd) => {
    const { operator, crdsField, removeAlmExamples, storeEditorOperator } = this.props;

    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, crdsField, crds);

    // remove alm examples from operator together with crd
    removeAlmExamples && this.onRemove(updatedOperator, removedCrd);

    storeEditorOperator(updatedOperator);
    this.validateField(updatedOperator);
  };

  onRemove = (operatorToUpdate, crd) => {
    const almExamples = _.get(operatorToUpdate, 'metadata.annotations.alm-examples');

    const examples = convertExampleYamlToObj(almExamples) || [];
    const newAlmExamples = examples.filter(example => example.kind !== crd.kind);

    _.set(operatorToUpdate, 'metadata.annotations.alm-examples', JSON.stringify(newAlmExamples));
  };

  validatePage = () => {
    const { operator, objectPage, formErrors, setSectionStatus, storeEditorFormErrors, crdsField } = this.props;

    const fields = [crdsField];
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
    const {
      operator,
      crdsField,
      crdsTitle,
      crdsDescription,
      objectPage,
      objectType,
      formErrors,
      history,
      sectionStatus
    } = this.props;

    const description = (
      <span>
        <p>{_.get(operatorObjectDescriptions, [...crdsField.split('.'), 'description'])}</p>
        <p>{crdsDescription}</p>
      </span>
    );
    const crdField = sectionsFields[objectPage];
    // do not allow setting page as Done when errored or pristine
    const pageHasErrors = sectionStatus[objectPage] === EDITOR_STATUS.empty || _.get(formErrors, crdField);

    return (
      <OperatorEditorSubPage
        title={crdsTitle}
        description={description}
        secondary
        history={history}
        section={objectPage}
        validatePage={this.validatePage}
        pageErrors={pageHasErrors}
      >
        <ListObjectEditor
          operator={operator}
          title={crdsTitle}
          onUpdate={this.updateOperator}
          field={crdsField}
          fieldFilter={field => field.name}
          fieldTitle="Display Name"
          objectPage={objectPage}
          formErrors={formErrors}
          history={history}
          objectTitleField="displayName"
          objectSubtitleField="name"
          pagePathField="name"
          objectType={objectType}
          addName="new-crd"
        />
      </OperatorEditorSubPage>
    );
  }
}

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
  setSectionStatus: PropTypes.func,
  removeAlmExamples: PropTypes.bool,
  sectionStatus: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorCRDsPage.defaultProps = {
  operator: {},
  formErrors: {},
  removeAlmExamples: false,
  storeEditorFormErrors: helpers.noop,
  storeEditorOperator: helpers.noop,
  setSectionStatus: helpers.noop,
  sectionStatus: {}
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
)(OperatorCRDsPage);
