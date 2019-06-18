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

const crdsField = sectionsFields['required-crds'];

class OperatorRequiredCRDEditPage extends React.Component {
  state = {
    crd: null,
    crdErrors: null
  };

  dirtyFields = {};

  componentDidMount() {
    const { operator, formErrors, storeEditorFormErrors } = this.props;
    const name = helpers.transformPathedName(_.get(this.props.match, 'params.crd', ''));
    let operatorCRDs = _.get(operator, crdsField);

    let crd = _.find(operatorCRDs, { name }) || _.find(operatorCRDs, { name: '' });

    if (!crd) {
      this.isNewCRD = true;
      crd = { name };

      if (!_.size(operatorCRDs)) {
        operatorCRDs = [];
      }

      operatorCRDs.push(crd);
    } else if (crd.name === '') {
      this.isNewCRD = true;
    }

    this.originalName = crd.name;
    this.crdIndex = operatorCRDs.indexOf(crd);

    const errors = getUpdatedFormErrors(operator, formErrors, crdsField);
    this.updateCrdErrors(errors);
    storeEditorFormErrors(errors);

    this.setState({ crd });

    if (crd.name === '') {
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
    this.setState({ crdErrors: _.get(crdErrors, 'errors') });

    if (crdErrors) {
      setSectionStatus(EDITOR_STATUS.errors, 'required-crds');
    } else {
      setSectionStatus(EDITOR_STATUS.pending, 'required-crds');
    }
  };

  updateCRD = (value, field) => {
    const { crd } = this.state;

    _.set(crd, field, value);
    this.forceUpdate();
  };

  validateField = field => {
    const { operator, formErrors, storeEditorOperator, storeEditorFormErrors } = this.props;
    const { crd } = this.state;
    const operatorCRDs = _.get(operator, crdsField);

    _.set(this.dirtyFields, field, true);

    const updatedOperator = _.cloneDeep(operator);

    // if we only have the placeholder CRD, replace it with this CRD
    if (operatorCRDs.length === 1 && !operatorCRDs[0].name) {
      _.set(updatedOperator, crdsField, [crd]);
      this.crdIndex = 0;
    } else {
      // update the operator's version of this CRD
      const existingCRDs = _.get(updatedOperator, crdsField);
      this.crdIndex = _.findIndex(existingCRDs, { name: this.originalName });
      if (this.crdIndex < 0) {
        existingCRDs.push(crd);
        this.crdIndex = 0;
      } else {
        _.set(updatedOperator, crdsField, [
          ...existingCRDs.slice(0, this.crdIndex),
          crd,
          ...existingCRDs.slice(this.crdIndex + 1)
        ]);
      }
    }

    const errors = getUpdatedFormErrors(updatedOperator, formErrors, crdsField);
    storeEditorFormErrors(errors);

    this.originalName = _.get(crd, 'name');

    storeEditorOperator(updatedOperator);
  };

  setNameInputRef = ref => {
    this.nameInput = ref;
  };

  renderCRDInput = (title, field, fieldType, inputRefCallback) => {
    const { crd, crdErrors } = this.state;

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
          onChange={e => this.updateCRD(e.target.value, field)}
          onBlur={() => this.validateField(field)}
          value={_.get(crd, field, '')}
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
          onChange={e => this.updateCRD(e.target.value, field)}
          onBlur={() => this.validateField(field)}
          value={_.get(crd, field, '')}
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
