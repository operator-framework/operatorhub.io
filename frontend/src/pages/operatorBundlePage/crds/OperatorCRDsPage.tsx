import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { History } from 'history';

import { noop } from '../../../common/helpers';
import OperatorEditorSubPage from '../subPage/OperatorEditorSubPage';
import ListObjectEditor from '../../../components/editor/ListObjectEditor';
import { convertExampleYamlToObj } from '../../../utils/operatorUtils';
import { getFieldValueError, containsErrors } from '../../../utils/operatorValidation';
import { operatorObjectDescriptions } from '../../../utils/operatorDescriptors';
import {
  storeEditorFormErrorsAction,
  storeEditorOperatorAction,
  setSectionStatusAction
} from '../../../redux/actions/editorActions';
import { getUpdatedFormErrors, getVersionEditorRootPath } from '../bundlePageUtils';
import { EDITOR_STATUS, sectionsFields, VersionEditorParamsMatch } from '../../../utils/constants';
import { StoreState } from '../../../redux';


const OperatorCRDsPageActions = {
  storeEditorOperator: storeEditorOperatorAction,
  storeEditorFormErrors: storeEditorFormErrorsAction,
  setSectionStatus: setSectionStatusAction
};

export type OperatorCRDsPageProps = {
  history: History,
  match: VersionEditorParamsMatch,
  crdsField: string,
  crdsTitle: string,
  crdsDescription: React.ReactNode,
  objectPage: string,
  objectType: string,
  removeAlmExamples: boolean,
} & ReturnType<typeof mapStateToProps> & typeof OperatorCRDsPageActions;

class OperatorCRDsPage extends React.PureComponent<OperatorCRDsPageProps> {

  static propTypes;
  static defaultProps;

  componentDidMount() {
    const { operator, sectionStatus, objectPage } = this.props;

    if (operator && sectionStatus[objectPage] !== EDITOR_STATUS.empty) {
      // validate
      this.validateField(operator);
    }
  }
  validateField = (operator, modified?) => {
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
      setSectionStatus(objectPage as any, EDITOR_STATUS.errors);
    } else if (modified){
      setSectionStatus(objectPage as any, EDITOR_STATUS.modified);
    } else if (status === EDITOR_STATUS.errors) {
      setSectionStatus(objectPage as any, EDITOR_STATUS.all_good);
    }
  };

  updateOperator = (crds, removedCrd) => {
    const { operator, crdsField, removeAlmExamples, storeEditorOperator } = this.props;

    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, crdsField, crds);

    // remove alm examples from operator together with crd
    removeAlmExamples && this.onRemove(updatedOperator, removedCrd);

    storeEditorOperator(updatedOperator);
    this.validateField(updatedOperator, true);
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
      setSectionStatus(objectPage as any, EDITOR_STATUS.errors);
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
      sectionStatus,
      match
    } = this.props;

    const description = (
      <span>
        <p>{_.get(operatorObjectDescriptions, [...crdsField.split('.'), 'description'])}</p>
        <p>{crdsDescription}</p>
      </span>
    );
    const crdField = sectionsFields[objectPage];
    const errors = _.get(formErrors, crdField);
    // do not allow setting page as Done when errored or pristine
    const pageHasErrors = sectionStatus[objectPage] === EDITOR_STATUS.empty || containsErrors(errors);
    const sectionPath = `${getVersionEditorRootPath(match)}/${objectPage}`;

    return (
      <OperatorEditorSubPage
        title={crdsTitle}
        description={description}
        secondary
        history={history}
        match={match}
        section={objectPage as any}
        validatePage={this.validatePage}
        pageErrors={pageHasErrors}
        versionEditorRootPath={getVersionEditorRootPath(match)}
      >
        <ListObjectEditor
          operator={operator}
          title={crdsTitle}
          onUpdate={this.updateOperator}
          field={crdsField}
          fieldTitle="Display Name"
          sectionPath={sectionPath}
          formErrors={formErrors}
          history={history}
          objectTitleField="displayName"
          objectSubtitleField="name"
          pagePathField="name"
          objectType={objectType}
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
  history: PropTypes.any.isRequired
};

OperatorCRDsPage.defaultProps = {
  operator: {},
  formErrors: {},
  removeAlmExamples: false,
  storeEditorFormErrors: noop,
  storeEditorOperator: noop,
  setSectionStatus: noop,
  sectionStatus: {}
};

const mapDispatchToProps = dispatch => bindActionCreators(OperatorCRDsPageActions, dispatch);

const mapStateToProps = (state: StoreState) => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors,
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorCRDsPage);
