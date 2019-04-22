import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import { safeDump, safeLoad } from 'js-yaml';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import ResourcesEditor from '../../components/editor/ResourcesEditor';
import {
  operatorFieldDescriptions,
  operatorFieldPlaceholders,
  operatorFieldValidators
} from '../../utils/operatorDescriptors';
import DescriptorsEditor from '../../components/editor/DescriptorsEditor';
import YamlViewer from '../../components/YamlViewer';

class OperatorCRDEditPage extends React.Component {
  state = {
    crd: null,
    formErrors: {},
    crdTemplateYaml: '',
    crdTemplateYamlError: ''
  };

  componentDidMount() {
    const { operator, crdsField, objectType } = this.props;
    const displayName = helpers.transformPathedName(_.get(this.props.match, 'params.crd', ''));
    let operatorCRDs = _.cloneDeep(_.get(operator, crdsField));

    let crd = _.find(operatorCRDs, { displayName });

    if (!crd) {
      this.isNewCRD = true;
      crd = { displayName };

      if (!_.size(operatorCRDs)) {
        operatorCRDs = [];
      }

      operatorCRDs.push(crd);
    }

    const kind = _.get(crd, 'kind');
    const examples = _.get(operator, 'metadata.annotations.alm-examples');
    let crdTemplates;
    if (_.isString(examples)) {
      try {
        crdTemplates = JSON.parse(examples);
      } catch (e) {
        crdTemplates = [];
      }
    } else {
      crdTemplates = examples;
    }

    const crdTemplate = _.find(crdTemplates, { kind });

    let crdTemplateYaml;
    try {
      crdTemplateYaml = safeDump(crdTemplate);
    } catch (e) {
      crdTemplateYaml = '';
    }

    this.originalName = crd.displayName;

    const formErrors = this.validateFormFields(crd);
    this.setState({ crd, crdTemplateYaml, formErrors });

    if (crd.displayName === `Add ${objectType}`) {
      setTimeout(() => {
        this.nameInput.focus();
        this.nameInput.select();
      }, 100);
    }
  }

  updateCRD = (value, field) => {
    const { crd, formErrors } = this.state;

    const updatedCRD = _.cloneDeep(crd);
    _.set(updatedCRD, field, value);

    const fieldError = this.getFieldValueError(updatedCRD, field);
    const updatedFormErrors = _.cloneDeep(formErrors) || {};
    _.set(updatedFormErrors, field, fieldError);

    this.setState({ crd: updatedCRD, formErrors: updatedFormErrors });
  };

  updateCrdResources = crd => {
    this.updateCRD(crd.resources, 'resources');
  };

  updateCrdSpecDescriptors = crd => {
    this.updateCRD(crd.specDescriptors, 'specDescriptors');
  };

  updateCrdStatusDescriptors = crd => {
    this.updateCRD(crd.statusDescriptors, 'statusDescriptors');
  };

  updateCrdActionDescriptors = crd => {
    this.updateCRD(crd.actionDescriptors, 'actionDescriptors');
  };

  onTemplateYamlChange = yaml => {
    try {
      const templates = safeLoad(yaml);
      this.updateCRD(templates, 'metadata.annotations.alm-examples');
      this.setState({ crdTemplateYaml: yaml, crdTemplateYamlError: '' });
    } catch (e) {
      this.setState({ crdTemplateYaml: yaml, crdTemplateYamlError: e.message });
    }
  };

  getFieldValueError = (crd, field) => {
    const { crdsField } = this.props;

    const value = _.get(crd, field);
    const fieldValidator = _.get(operatorFieldValidators, `${crdsField}.${field}`, {});

    const fieldRegex = _.get(fieldValidator, 'regex');
    if (fieldRegex) {
      if (!fieldRegex.test(value)) {
        return _.get(fieldValidator, 'regexErrorMessage');
      }
    }

    const validator = _.get(fieldValidator, 'validator');
    if (validator) {
      return validator(value);
    }

    if (fieldValidator.required && _.isEmpty(value)) {
      return 'This field is required';
    }

    return null;
  };

  validateFormFields = crd => {
    const { crdsField } = this.props;

    const validators = _.get(operatorFieldValidators, crdsField);
    const formErrors = {};
    _.forEach(_.keys(validators), key => {
      const error = this.getFieldValueError(crd, key);
      if (error) {
        formErrors[key] = error;
      }
    });
    return formErrors;
  };

  validateField = field => {
    const { operator, crdsField, storeEditorOperator } = this.props;
    const { crd, formErrors } = this.state;
    const operatorCRDs = _.get(operator, crdsField);

    // Check if we have a valid CRD, if not only update the editor's CRD
    if (!_.some(_.keys(formErrors), key => !!formErrors[key])) {
      const updatedOperator = _.cloneDeep(operator);

      // if we only have the placeholder CRD, replace it with this CRD
      if (operatorCRDs.length === 1 && !operatorCRDs[0].displayName) {
        _.set(updatedOperator, crdsField, [crd]);
      } else {
        // update the operator's version of this CRD
        const existingCRDs = _.get(updatedOperator, crdsField);
        const index = _.indexOf(existingCRDs, { displayName: this.originalName });
        if (index < 0) {
          existingCRDs.push(crd);
        } else {
          _.set(updatedOperator, crdsField, [...existingCRDs.slice(0, index), crd, ...existingCRDs.slice(index + 1)]);
        }
      }

      this.isNewCRD = false;
      storeEditorOperator(updatedOperator);
    }
  };

  setNameInputRef = ref => {
    this.nameInput = ref;
  };

  renderCRDInput = (title, field, fieldType, inputRefCallback) => {
    const { crdsField } = this.props;
    const { crd, formErrors } = this.state;

    const error = !(this.isNewCRD && _.isEmpty(_.get(crd, field))) && _.get(formErrors, field);

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

  renderCRDFields = () => (
    <React.Fragment>
      {this.renderCRDInput('Display Name', 'displayName', 'text', this.setNameInputRef)}
      {this.renderCRDInput('Description', 'description', 'text-area')}
      {this.renderCRDInput('Group', 'group', 'text')}
      {this.renderCRDInput('Kind', 'kind', 'text')}
      {this.renderCRDInput('Name', 'name', 'text')}
      {this.renderCRDInput('Version', 'version', 'text')}
    </React.Fragment>
  );

  renderDescriptors = () => {
    const { crdsField } = this.props;
    const { crd } = this.state;

    return (
      <div className="oh_operator-editor__crd-descriptors">
        <h3>SpecDescriptors, StatusDescriptors, and ActionDescriptors</h3>
        <p>{_.get(operatorFieldDescriptions, `${crdsField}.descriptors`)}</p>
        <DescriptorsEditor
          crd={crd}
          title="SpecDescriptors"
          singular="SpecDescriptor"
          description="A reference to fields in the spec block of an object."
          onUpdate={this.updateCrdSpecDescriptors}
          descriptorsField="specDescriptors"
        />
        <DescriptorsEditor
          crd={crd}
          title="StatusDescriptors"
          singular="StatusDescriptor"
          description="A reference to fields in the status block of an object."
          onUpdate={this.updateCrdStatusDescriptors}
          descriptorsField="statusDescriptors"
        />
        <DescriptorsEditor
          crd={crd}
          title="ActionDescriptors"
          singular="ActionDescriptor"
          description="A reference to fields in the action block of an object."
          noSeparator
          onUpdate={this.updateCrdActionDescriptors}
          descriptorsField="actionDescriptors"
        />
      </div>
    );
  };

  renderTemplates = () => {
    const { crdTemplateYaml, crdTemplateYamlError } = this.state;

    return (
      <React.Fragment>
        <h3>CRD Templates</h3>
        <p>{_.get(operatorFieldDescriptions, 'metadata.annotations.alm-examples')}</p>
        <YamlViewer
          onChange={yaml => this.onTemplateYamlChange(yaml)}
          editable
          yaml={crdTemplateYaml}
          error={crdTemplateYamlError}
          allowClear
        />
      </React.Fragment>
    );
  };

  render() {
    const { crdsField, objectType, lastPage, lastPageTitle, history } = this.props;
    const { crd } = this.state;

    return (
      <OperatorEditorSubPage
        title={`Edit ${objectType}`}
        tertiary
        lastPage={lastPage}
        lastPageTitle={lastPageTitle}
        history={history}
      >
        <form className="oh-operator-editor-form">
          {this.renderCRDFields()}
          <ResourcesEditor
            crd={crd}
            onUpdate={this.updateCrdResources}
            title="Resources"
            field={`${crdsField}.resources`}
          />
          {this.renderDescriptors()}
          {this.renderTemplates()}
        </form>
      </OperatorEditorSubPage>
    );
  }
}

OperatorCRDEditPage.propTypes = {
  operator: PropTypes.object,
  crdsField: PropTypes.string.isRequired,
  objectType: PropTypes.string.isRequired,
  lastPage: PropTypes.string.isRequired,
  lastPageTitle: PropTypes.string.isRequired,
  storeEditorOperator: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired
};

OperatorCRDEditPage.defaultProps = {
  operator: {},
  storeEditorOperator: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  storeEditorOperator: operator =>
    dispatch({
      type: reduxConstants.SET_EDITOR_OPERATOR,
      operator
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorCRDEditPage);
