import * as React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import { safeDump, safeLoad } from 'js-yaml';

import { helpers } from '../../../common/helpers';
import OperatorEditorSubPage from '../OperatorEditorSubPage';
import ResourcesEditor from '../../../components/editor/ResourcesEditor';
import { operatorFieldDescriptions } from '../../../utils/operatorDescriptors';
import DescriptorsEditor, { isDescriptorEmpty } from '../../../components/editor/DescriptorsEditor';
import YamlViewer from '../../../components/YamlViewer';
import { EDITOR_STATUS, getUpdatedFormErrors, sectionsFields } from '../bundlePageUtils';
import { getDefaultOnwedCRD, getDefaultAlmExample, convertExampleYamlToObj } from '../../../utils/operatorUtils';
import {
  setSectionStatusAction,
  storeEditorFormErrorsAction,
  storeEditorOperatorAction
} from '../../../redux/actions/editorActions';
import { NEW_CRD_NAME, SPEC_CAPABILITIES, STATUS_CAPABILITIES } from '../../../utils/constants';
import OperatorTextArea from '../../../components/editor/forms/OperatorTextArea';
import OperatorInput from '../../../components/editor/forms/OperatorInput';

const crdsField = sectionsFields['owned-crds'];
const crdDescriptions = _.get(operatorFieldDescriptions, crdsField);

class OperatorOwnedCRDEditPage extends React.Component {
  state = {
    crd: null,
    crdErrors: null,
    crdTemplate: null,
    crdTemplateYamlError: ''
  };

  touchedFields = {};
  crdIndex;
  isNewCRD = false;
  nameInput;
  originalName;

  constructor(props) {
    super(props);

    this.crdIndex = parseInt(_.get(props.match, 'params.index'), 10);
  }

  componentDidMount() {
    const { operator, formErrors, storeEditorFormErrors, sectionStatus, isNew } = this.props;
    const operatorCRDs = _.get(operator, crdsField) || [];

    this.name = helpers.transformPathedName(_.get(this.props.match, 'params.crd', ''));

    // find crd by name or take default empty one
    let crd = operatorCRDs[this.crdIndex];

    this.isNewCRD = isNew;

    if (this.isNewCRD) {
      crd = getDefaultOnwedCRD();
      crd.name = NEW_CRD_NAME;
      this.crdIndex = operatorCRDs.length;

      operatorCRDs.push(crd);
    }

    this.crdIndex = operatorCRDs.indexOf(crd);
    const kind = _.get(crd, 'kind');
    const examples = _.get(operator, 'metadata.annotations.alm-examples');
    const crdTemplates = convertExampleYamlToObj(examples);
    const crdTemplate = _.find(crdTemplates, { kind }) || getDefaultAlmExample();

    // do not update status or validate pristine page
    if (sectionStatus !== EDITOR_STATUS.empty) {
      // get existing errors and revalidate CRDs fields
      const errors = getUpdatedFormErrors(operator, formErrors, crdsField);

      this.updateCrdErrors(errors);
      storeEditorFormErrors(errors);
    }

    this.setState({ crd, crdTemplate });

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

  /**
   * Update local state with errors after they arive from redux
   * Update CRD section state
   * @param {*} formErrors
   */
  updateCrdErrors = formErrors => {
    const { setSectionStatus } = this.props;

    const crdErrors = _.find(_.get(formErrors, crdsField), { index: this.crdIndex });
    this.setState({ crdErrors: _.get(crdErrors, 'errors') });

    if (crdErrors) {
      setSectionStatus('owned-crds', EDITOR_STATUS.errors);
    } else {
      setSectionStatus('owned-crds', EDITOR_STATUS.pending);
    }
  };

  /**
   * Some field changed so we need to update crd
   * @param {*} value
   * @param {string} field
   */
  updateCRD = (value, field) => {
    const { crd, crdTemplate } = this.state;
    const updateTemplate = _.cloneDeep(crdTemplate || {});

    if (field === 'kind') {
      updateTemplate.kind = value;

      this.setState({ crdTemplate: updateTemplate });
      // push changed template to ALM examples
      this.updateAlmTemplates(updateTemplate);
    }

    _.set(crd, field, value);
    this.forceUpdate();
  };

  /**
   * Validate YAML examples and update operator
   */
  onTemplateYamlChange = yaml => {
    const { crd } = this.state;

    let crdTemplateYamlError = '';

    try {
      const template = safeLoad(yaml);
      this.updateAlmTemplates(template);

      if (template.kind !== crd.kind) {
        crdTemplateYamlError = 'Yaml kind property has to match CRD kind.';
      }

      this.setState({ crdTemplate: template, crdTemplateYamlError });
    } catch (e) {
      this.setState({ crdTemplateYamlError: e.message });
    }
  };

  /**
   * Update ALM examples in operator with example of this CRD
   */
  updateAlmTemplates = template => {
    const { operator, storeEditorOperator } = this.props;
    const { crd } = this.state;

    const examples = _.get(operator, 'metadata.annotations.alm-examples');
    const crdTemplates = convertExampleYamlToObj(examples);
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
  };

  /**
   * CRD editor populates CRD with empty samples of descriptors so they appear in form
   * However they can't leak outside of local state as they break validation
   * and malform CSV yaml with empty values
   * Therefore we need to clean them up
   */
  cleanEmptySampleFields = crd => {
    const cleanedCrd = _.cloneDeep(crd);

    if (cleanedCrd.specDescriptors) {
      cleanedCrd.specDescriptors = cleanedCrd.specDescriptors.filter(descriptor => !isDescriptorEmpty(descriptor));
    }
    if (cleanedCrd.statusDescriptors) {
      cleanedCrd.statusDescriptors = cleanedCrd.statusDescriptors.filter(descriptor => !isDescriptorEmpty(descriptor));
    }

    return cleanedCrd;
  };

  validateField = field => {
    const { operator, formErrors, storeEditorOperator, storeEditorFormErrors } = this.props;
    const { crd } = this.state;

    _.set(this.touchedFields, field, true);

    const updatedOperator = _.cloneDeep(operator);
    // do not validate empty sample fields - they are stripped before export
    const cleanedCrd = this.cleanEmptySampleFields(crd);

    // update the operator's version of this CRD
    const existingCRDs = _.get(updatedOperator, crdsField);

    if (this.crdIndex < 0) {
      existingCRDs.push(cleanedCrd);
      this.crdIndex = 0;
    } else {
      _.set(updatedOperator, crdsField, [
        ...existingCRDs.slice(0, this.crdIndex),
        cleanedCrd,
        ...existingCRDs.slice(this.crdIndex + 1)
      ]);
    }

    const errors = getUpdatedFormErrors(updatedOperator, formErrors, crdsField);
    storeEditorFormErrors(errors);

    if (field === 'name') {
      const value = cleanedCrd[field];
      // update reference name
      value !== this.originalName && this.updatePagePathOnNameChange(value);
    }

    storeEditorOperator(updatedOperator);
  };

  updatePagePathOnNameChange = name => {
    const { location, history, isNew } = this.props;

    if (!isNew) {
      history.push(location.pathname.replace(this.originalName, name));
      this.originalName = name;
    }
  };

  onTemplateClear = () => {
    const { crd } = this.state;

    const example = getDefaultAlmExample();
    example.kind = crd.kind || '';

    return safeDump(example);
  };

  setNameInputRef = ref => {
    this.nameInput = ref;
  };

  renderCRDInput = (title, field, fieldType, inputRefCallback) => {
    const { crd, crdErrors } = this.state;

    // ignore errors on new CRDs for untouched fields
    const errors = (!(this.isNewCRD && !_.get(this.touchedFields, field, false)) && crdErrors) || {};

    if (fieldType === 'text-area') {
      return (
        <OperatorTextArea
          field={field}
          title={title}
          value={_.get(crd, field, '')}
          formErrors={errors}
          updateOperator={this.updateCRD}
          commitField={this.validateField}
          refCallback={inputRefCallback}
          descriptions={crdDescriptions}
        />
      );
    }
    return (
      <OperatorInput
        field={field}
        title={title}
        value={_.get(crd, field, '')}
        inputType="text"
        formErrors={errors}
        updateOperator={this.updateCRD}
        commitField={this.validateField}
        refCallback={inputRefCallback}
        descriptions={crdDescriptions}
      />
    );
  };

  render() {
    const { history } = this.props;
    const { crd, crdErrors, crdTemplate, crdTemplateYamlError } = this.state;

    let crdTemplateYaml;

    if (crdTemplate) {
      try {
        crdTemplateYaml = safeDump(crdTemplate);
      } catch (e) {
        console.error(`Unable to convert alm-examples to YAML: ${e}`);
        crdTemplateYaml = '';
      }
    }

    return (
      <OperatorEditorSubPage
        title="Edit Owned CRD"
        tertiary
        lastPage="owned-crds"
        lastPageTitle="Owned CRDs"
        history={history}
      >
        <form className="oh-operator-editor-form">
          {this.renderCRDInput('Name', 'name', 'text', this.setNameInputRef)}
          {this.renderCRDInput('Display Name', 'displayName', 'text')}
          {this.renderCRDInput('Description', 'description', 'text-area')}
          {this.renderCRDInput('Kind', 'kind', 'text')}
          {this.renderCRDInput('Version', 'version', 'text')}
          <ResourcesEditor
            crd={crd}
            crdErrors={crdErrors}
            onUpdate={() => this.validateField('resources')}
            title="Resources"
            field={`${crdsField}.resources`}
          />
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
              descriptorOptions={SPEC_CAPABILITIES}
            />
            <DescriptorsEditor
              crd={crd}
              title="StatusDescriptors"
              singular="StatusDescriptor"
              descriptorsErrors={_.get(crdErrors, 'statusDescriptors')}
              description="A reference to fields in the status block of an object."
              onUpdate={() => this.validateField('statusDescriptors')}
              descriptorsField="statusDescriptors"
              descriptorOptions={STATUS_CAPABILITIES}
            />
          </div>
          <h3>CRD Templates</h3>
          <p>{_.get(operatorFieldDescriptions, 'metadata.annotations.alm-examples')}</p>
          <YamlViewer
            onBlur={yaml => this.onTemplateYamlChange(yaml)}
            editable
            yaml={crdTemplateYaml}
            error={crdTemplateYamlError}
            onClear={this.onTemplateClear}
            allowClear
          />
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
  match: PropTypes.object.isRequired,
  location: PropTypes.object,
  isNew: PropTypes.bool
};

OperatorOwnedCRDEditPage.defaultProps = {
  operator: {},
  formErrors: {},
  sectionStatus: {},
  location: {},
  isNew: false,
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
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorOwnedCRDEditPage);
