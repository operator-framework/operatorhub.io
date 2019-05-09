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
import { EDITOR_STATUS, getUpdatedFormErrors, sectionsFields } from './editorPageUtils';

const crdsField = sectionsFields['owned-crds'];

const specCapabilities = [
  'urn:alm:descriptor:com.tectonic.ui:podCount',
  'urn:alm:descriptor:com.tectonic.ui:endpointList',
  'urn:alm:descriptor:com.tectonic.ui:label',
  'urn:alm:descriptor:com.tectonic.ui:resourceRequirements',
  'urn:alm:descriptor:com.tectonic.ui:selector:',
  'urn:alm:descriptor:com.tectonic.ui:namespaceSelector',
  'urn:alm:descriptor:io.kubernetes:',
  'urn:alm:descriptor:com.tectonic.ui:booleanSwitch'
];

const statusCapabilities = [
  'urn:alm:descriptor:com.tectonic.ui:podStatuses',
  'urn:alm:descriptor:com.tectonic.ui:podCount',
  'urn:alm:descriptor:org.w3:link',
  'urn:alm:descriptor:io.kubernetes.conditions',
  'urn:alm:descriptor:text',
  'urn:alm:descriptor:prometheusEndpoint',
  'urn:alm:descriptor:io.kubernetes.phase',
  'urn:alm:descriptor:io.kubernetes.phase:reason',
  'urn:alm:descriptor:io.kubernetes:'
];

class OperatorOwnedCRDEditPage extends React.Component {
  state = {
    crd: null,
    crdErrors: null,
    crdTemplateYaml: '',
    crdTemplateYamlError: ''
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
      crd.name = name;
    }

    this.crdIndex = operatorCRDs.indexOf(crd);
    const kind = _.get(crd, 'kind');
    const examples = _.get(operator, 'metadata.annotations.alm-examples');
    const crdTemplates = this.convertExamplesToObj(examples);

    let crdTemplateYaml = '';
    const crdTemplate = _.find(crdTemplates, { kind });
    if (crdTemplate) {
      try {
        crdTemplateYaml = safeDump(crdTemplate);
      } catch (e) {
        console.error(`Unable to convert alm-examples to YAML: ${e}`);
        crdTemplateYaml = '';
      }
    }

    this.section = crdsField === 'owned' ? 'owned-crds' : 'required-crds';
    this.originalName = crd.name;

    const errors = getUpdatedFormErrors(operator, formErrors, crdsField, storeEditorFormErrors);
    this.updateCrdErrors(errors);
    storeEditorFormErrors(errors);

    this.setState({ crd, crdTemplateYaml });

    if (crd.name === 'new-crd') {
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
      setSectionStatus(EDITOR_STATUS.errors, this.section);
    } else {
      setSectionStatus(EDITOR_STATUS.pending, this.section);
    }
  };

  convertExamplesToObj = examples => {
    let crdTemplates;
    if (_.isString(examples)) {
      try {
        crdTemplates = JSON.parse(examples);
      } catch (e) {
        console.error(`Unable to convert alm-examples: ${e}`);
        crdTemplates = [];
      }
    } else {
      crdTemplates = examples;
    }
    return crdTemplates;
  };

  updateCRD = (value, field) => {
    const { crd } = this.state;

    _.set(crd, field, value);
    this.forceUpdate();
  };

  onTemplateYamlChange = yaml => {
    const { operator, storeEditorOperator } = this.props;
    const { crd } = this.state;

    try {
      const template = safeLoad(yaml);
      const examples = _.get(operator, 'metadata.annotations.alm-examples');
      const crdTemplates = this.convertExamplesToObj(examples);
      const index = _.findIndex(crdTemplates, { kind: _.get(crd, 'kind') });
      let updatedTemplates;
      if (index >= 0) {
        updatedTemplates = [...crdTemplates.slice(0, index), template, ...crdTemplates.slice(index + 1)];
      } else {
        updatedTemplates = [...crdTemplates, template];
      }
      const updatedExamples = JSON.stringify(updatedTemplates);

      const updatedOperator = _.cloneDeep(operator);
      _.set(updatedOperator, 'metadata.annotations.alm-examples', updatedExamples);

      storeEditorOperator(updatedOperator);

      this.setState({ crdTemplateYaml: yaml, crdTemplateYamlError: '' });
    } catch (e) {
      this.setState({ crdTemplateYaml: yaml, crdTemplateYamlError: e.message });
    }
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

  renderCRDFields = () => (
    <React.Fragment>
      {this.renderCRDInput('Name', 'name', 'text', this.setNameInputRef)}
      {this.renderCRDInput('Display Name', 'displayName', 'text')}
      {this.renderCRDInput('Description', 'description', 'text-area')}
      {this.renderCRDInput('Kind', 'kind', 'text')}
      {this.renderCRDInput('Version', 'version', 'text')}
    </React.Fragment>
  );

  renderDescriptors = () => {
    const { crd, crdErrors } = this.state;

    return (
      <div className="oh_operator-editor__crd-descriptors">
        <h3>SpecDescriptors, StatusDescriptors, and ActionDescriptors</h3>
        <p>{_.get(operatorFieldDescriptions, `${crdsField}.descriptors`)}</p>
        <DescriptorsEditor
          crd={crd}
          title="SpecDescriptors"
          singular="SpecDescriptor"
          descriptorsErrors={_.get(crdErrors, 'specDescriptors')}
          description="A reference to fields in the spec block of an object."
          onUpdate={() => this.validateField('specDescriptors')}
          descriptorsField="specDescriptors"
          descriptorOptions={specCapabilities}
        />
        <DescriptorsEditor
          crd={crd}
          title="StatusDescriptors"
          singular="StatusDescriptor"
          descriptorsErrors={_.get(crdErrors, 'statusDescriptors')}
          description="A reference to fields in the status block of an object."
          onUpdate={() => this.validateField('statusDescriptors')}
          descriptorsField="statusDescriptors"
          descriptorOptions={statusCapabilities}
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
          onBlur={yaml => this.onTemplateYamlChange(yaml)}
          editable
          yaml={crdTemplateYaml}
          error={crdTemplateYamlError}
          allowClear
        />
      </React.Fragment>
    );
  };

  render() {
    const { history } = this.props;
    const { crd, crdErrors } = this.state;

    return (
      <OperatorEditorSubPage
        title="Edit Owned CRD"
        tertiary
        lastPage="owned-crds"
        lastPageTitle="Owned CRDs"
        history={history}
      >
        <form className="oh-operator-editor-form">
          {this.renderCRDFields()}
          <ResourcesEditor
            crd={crd}
            crdErrors={crdErrors}
            onUpdate={() => this.validateField('resources')}
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

OperatorOwnedCRDEditPage.propTypes = {
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

OperatorOwnedCRDEditPage.defaultProps = {
  operator: {},
  formErrors: {},
  sectionStatus: {},
  storeEditorOperator: helpers.noop,
  storeEditorFormErrors: helpers.noop,
  setSectionStatus: helpers.noop
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
    }),
  setSectionStatus: (status, section) =>
    dispatch({
      type: reduxConstants.SET_EDITOR_SECTION_STATUS,
      section,
      status
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors,
  sectionStatus: {}
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorOwnedCRDEditPage);
