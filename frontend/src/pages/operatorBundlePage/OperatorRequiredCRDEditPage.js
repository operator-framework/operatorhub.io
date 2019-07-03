import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import {
  operatorFieldDescriptions,
  operatorFieldPlaceholders,
  operatorFieldValidators
} from '../../utils/operatorDescriptors';
import { EDITOR_STATUS, getUpdatedFormErrors, sectionsFields } from './bundlePageUtils';
import {
  setSectionStatusAction,
  storeEditorFormErrorsAction,
  storeEditorOperatorAction
} from '../../redux/actions/editorActions';
import { getDefaultRequiredCRD } from '../../utils/operatorUtils';
import { NEW_CRD_NAME } from '../../utils/constants';

const crdsField = sectionsFields['required-crds'];

class OperatorRequiredCRDEditPage extends React.Component {
  dirtyFields = {};
  crdIndex;
  isNewCRD = false;

  componentDidMount() {
    const { operator, formErrors, storeEditorFormErrors, storeEditorOperator } = this.props;
    const name = helpers.transformPathedName(_.get(this.props.match, 'params.crd', ''));
    const clonedOperator = _.cloneDeep(operator);
    const operatorCRDs = _.get(clonedOperator, crdsField, []);

    let crd = _.find(operatorCRDs, { name }) || _.find(operatorCRDs, { name: '' });

    if (!crd) {
      this.isNewCRD = true;

      crd = getDefaultRequiredCRD();
      crd.name = name;

      operatorCRDs.push(crd);
    } else if (crd.name === '' || crd.name === NEW_CRD_NAME) {
      this.isNewCRD = true;

      crd.name = NEW_CRD_NAME;
    }
    this.crdIndex = operatorCRDs.indexOf(crd);

    const errors = getUpdatedFormErrors(clonedOperator, formErrors, crdsField);
    this.updateCrdErrors(errors);
    storeEditorFormErrors(errors);

    // update operator with crds if they were not existing
    _.set(clonedOperator, crdsField, operatorCRDs);
    // update operator as there might be added / changed crd
    storeEditorOperator(clonedOperator);

    if (crd.name === '' || crd.name === NEW_CRD_NAME) {
      setTimeout(() => {
        this.nameInput.focus();
        this.nameInput.select();
      }, 100);
    }
  }

  componentDidUpdate(prevProps) {
    const { formErrors } = this.props;

    if (!_.isEqual(formErrors, prevProps.formErrors)) {
      this.updateCrdErrors(formErrors);
    }
  }

  updateCrdErrors = formErrors => {
    const { setSectionStatus } = this.props;

    const crdErrors = _.find(_.get(formErrors, crdsField), { index: this.crdIndex });

    if (crdErrors) {
      setSectionStatus('required-crds', EDITOR_STATUS.errors);
    } else {
      setSectionStatus('required-crds', EDITOR_STATUS.pending);
    }
  };

  validateField = (field, value) => {
    const { operator, formErrors, storeEditorOperator, storeEditorFormErrors } = this.props;
    const updatedOperator = _.cloneDeep(operator);

    _.set(this.dirtyFields, field, true);

    // update the operator's version of this CRD
    const existingCRDs = _.get(updatedOperator, crdsField);
    const crd = existingCRDs[this.crdIndex];

    // update crd field value
    _.set(crd, field, value);

    _.set(updatedOperator, crdsField, [
      ...existingCRDs.slice(0, this.crdIndex),
      crd,
      ...existingCRDs.slice(this.crdIndex + 1)
    ]);

    const errors = getUpdatedFormErrors(updatedOperator, formErrors, crdsField);
    storeEditorFormErrors(errors);

    storeEditorOperator(updatedOperator);
  };

  setNameInputRef = ref => {
    this.nameInput = ref;
  };

  renderCRDInput = (title, field, fieldType, inputRefCallback) => {
    const { operator, formErrors } = this.props;
    const crdErrors = _.find(_.get(formErrors, crdsField), { index: this.crdIndex });

    // update the operator's version of this CRD
    const existingCRDs = _.get(operator, crdsField);
    const crd = existingCRDs[this.crdIndex];

    const error = !(this.isNewCRD && !_.get(this.dirtyFields, field, false)) && _.get(crdErrors, field);

    const formFieldClasses = classNames({
      'oh-operator-editor-form__field': true,
      row: true,
      'oh-operator-editor-form__field--error': error
    });

    let inputComponent;
    if (fieldType === 'text-area') {
      inputComponent = (
        <input
          id={field}
          className="form-control"
          type="text-area"
          rows={3}
          {..._.get(_.get(operatorFieldValidators, `${crdsField}.${field}`), 'props')}
          onBlur={e => this.validateField(field, e.target.value)}
          defaultValue={_.get(crd, field, '')}
          placeholder={_.get(operatorFieldPlaceholders, `${crdsField}.${field}`)}
          ref={inputRefCallback || helpers.noop}
        />
      );
    } else {
      inputComponent = (
        <input
          id={field}
          className="form-control"
          type="text"
          {..._.get(_.get(operatorFieldValidators, `${crdsField}.${field}`), 'props')}
          onBlur={e => this.validateField(field, e.target.value)}
          defaultValue={_.get(crd, field, '')}
          placeholder={_.get(operatorFieldPlaceholders, `${crdsField}.${field}`)}
          ref={inputRefCallback || helpers.noop}
        />
      );
    }
    return (
      <div className={formFieldClasses}>
        <div className="form-group col-sm-6">
          <label htmlFor={field}>{title}</label>
          {inputComponent}
          {error && <div className="oh-operator-editor-form__error-block">{error}</div>}
        </div>
        <div className="oh-operator-editor-form__description col-sm-6">
          {_.get(operatorFieldDescriptions, `${crdsField}.${field}`, '')}
        </div>
      </div>
    );
  };

  render() {
    const { history } = this.props;

    return (
      <OperatorEditorSubPage
        title="Edit Required CRD"
        tertiary
        lastPage="required-crds"
        lastPageTitle="Required CRDs"
        history={history}
      >
        <form className="oh-operator-editor-form">
          {this.renderCRDInput('Name', 'name', 'text', this.setNameInputRef)}
          {this.renderCRDInput('Display Name', 'displayName', 'text')}
          {this.renderCRDInput('Description', 'description', 'text-area')}
          {this.renderCRDInput('Kind', 'kind', 'text')}
          {this.renderCRDInput('Version', 'version', 'text')}
        </form>
      </OperatorEditorSubPage>
    );
  }
}

OperatorRequiredCRDEditPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  sectionStatus: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  setSectionStatus: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired
};

OperatorRequiredCRDEditPage.defaultProps = {
  operator: {},
  formErrors: {},
  sectionStatus: {},
  storeEditorOperator: helpers.noop,
  storeEditorFormErrors: helpers.noop,
  setSectionStatus: helpers.noop
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
  sectionStatus: {}
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorRequiredCRDEditPage);
