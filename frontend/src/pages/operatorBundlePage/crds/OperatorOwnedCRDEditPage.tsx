import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { safeDump, safeLoad } from 'js-yaml';
import { History } from 'history';

import { noop, transformPathedName } from '../../../common/helpers';
import OperatorEditorSubPage from '../subPage/OperatorEditorSubPage';
import ResourcesEditor from '../../../components/editor/ResourcesEditor';
import { operatorFieldDescriptions } from '../../../utils/operatorDescriptors';
import DescriptorsEditor from '../../../components/editor/descriptors/DescriptorsEditor';
import YamlViewer from '../../../components/YamlViewer';
import { getUpdatedFormErrors, getVersionEditorRootPath } from '../bundlePageUtils';
import {
  getDefaultOnwedCRD,
  getDefaultAlmExample,
  convertExampleYamlToObj,
  getDefaultCrdDescriptor
} from '../../../utils/operatorUtils';
import { containsErrors } from '../../../utils/operatorValidation';
import {
  setSectionStatusAction,
  storeEditorFormErrorsAction,
  storeEditorOperatorAction
} from '../../../redux/actions/editorActions';
import {
  NEW_CRD_NAME,
  SPEC_CAPABILITIES,
  STATUS_CAPABILITIES,
  EDITOR_STATUS,
  sectionsFields,
  VersionEditorParamsMatch
} from '../../../utils/constants';

import OperatorTextAreaUncontrolled from '../../../components/editor/forms/OperatorTextAreaUncontrolled';
import OperatorInputUncontrolled from '../../../components/editor/forms/OperatorInputUncontrolled';
import { StoreState } from '../../../redux';

const crdsField = sectionsFields['owned-crds'];
const crdDescriptions = _.get(operatorFieldDescriptions, crdsField);

const OperatorOwnedCRDEditPageActions = {
  storeEditorOperator: storeEditorOperatorAction,
  storeEditorFormErrors: storeEditorFormErrorsAction,
  setSectionStatus: setSectionStatusAction
};

export type OperatorOwnedCRDEditPageProps = {
  isNew: boolean,
  history: History,
  match: VersionEditorParamsMatch
} & ReturnType<typeof mapStateToProps> & typeof OperatorOwnedCRDEditPageActions;

interface OperatorOwnedCRDEditPageState {
  crdTemplate: any,
  crdTemplateYamlError: string
  specDescriptorsExpandedByError: boolean
  statusDescriptorsExpandedByError: boolean
}

class OperatorOwnedCRDEditPage extends React.PureComponent<OperatorOwnedCRDEditPageProps, OperatorOwnedCRDEditPageState> {

  static propTypes;
  static defaultProps;

  state: OperatorOwnedCRDEditPageState = {
    crdTemplate: null,
    crdTemplateYamlError: '',
    specDescriptorsExpandedByError: false,
    statusDescriptorsExpandedByError: false
  };

  touchedFields = {};
  crdIndex;
  isNewCRD = false;
  nameInput;
  originalName: string;

  almExampleIndex;

  constructor(props) {
    super(props);

    this.crdIndex = parseInt(_.get(props.match, 'params.index'), 10);
  }

  componentDidMount() {
    const { operator, formErrors, storeEditorFormErrors, sectionStatus, isNew, storeEditorOperator } = this.props;
    const updatedOperator = _.cloneDeep(operator);
    const operatorCRDs = _.get(updatedOperator, crdsField) || [];

    const examples = _.get(updatedOperator, 'metadata.annotations.alm-examples');
    const crdTemplates = convertExampleYamlToObj(examples);

    let specDescriptorsExpandedByError = false;
    let statusDescriptorsExpandedByError = false;

    //this.name = transformPathedName(_.get(match, 'params.crd', ''));

    // find crd by name or take default empty one
    let crd = operatorCRDs[this.crdIndex];

    this.isNewCRD = isNew;

    if (this.isNewCRD) {
      crd = getDefaultOnwedCRD();
      crd.name = NEW_CRD_NAME;
      this.crdIndex = operatorCRDs.length;

      operatorCRDs.push(crd);

      // update examples with empty one for this crd
      _.set(
        updatedOperator,
        'metadata.annotations.alm-examples',
        JSON.stringify([...crdTemplates, getDefaultAlmExample()])
      );

      storeEditorOperator(updatedOperator);
    }

    this.almExampleIndex = _.findIndex(crdTemplates, { kind: _.get(crd, 'kind', '') });

    const crdTemplate = this.getAlmExample();


    // get existing errors and revalidate CRDs fields
    const errors = getUpdatedFormErrors(updatedOperator, formErrors, crdsField);
    const crdErrors = (_.get(errors, crdsField) || []).find(error => error.index === this.crdIndex) || null;

    // expand descriptor editors if errors are detected
    specDescriptorsExpandedByError = containsErrors(_.get(crdErrors, 'errors.specDescriptors', null));
    statusDescriptorsExpandedByError = containsErrors(_.get(crdErrors, 'errors.statusDescriptors', null));

    this.updateSectionStatus(errors, true);
    storeEditorFormErrors(errors);

    this.setState({ crdTemplate, specDescriptorsExpandedByError, statusDescriptorsExpandedByError });

    if (crd.name === '' || crd.name === NEW_CRD_NAME) {
      setTimeout(() => {
        this.nameInput.focus();
        this.nameInput.select();
      }, 100);
    }
  }

  getCrd = () => {
    const { operator } = this.props;

    const operatorCRDs = _.get(operator, crdsField) || [];

    return operatorCRDs[this.crdIndex];
  };

  getAlmExample = () => {
    const { operator } = this.props;

    const examples = _.get(operator, 'metadata.annotations.alm-examples');
    const crdTemplates = convertExampleYamlToObj(examples);
    const crdTemplate = crdTemplates[this.almExampleIndex] || getDefaultAlmExample();

    return crdTemplate;
  };

  getCrdErrors = () => {
    const { formErrors } = this.props;

    return (_.find(_.get(formErrors, crdsField), { index: this.crdIndex }) || { errors: {} }).errors;
  };

  componentDidUpdate(prevProps) {
    const { formErrors } = this.props;

    if (!_.isEqual(formErrors, prevProps.formErrors)) {
      this.updateSectionStatus(formErrors);
    }
  }

  /**
   * Update local state with errors after they arive from redux
   * Update CRD section state
   * @param {*} formErrors
   */
  updateSectionStatus = (formErrors, modified?) => {
    const { sectionStatus, setSectionStatus } = this.props;

    const status = sectionStatus['owned-crds'];
    const crdErrors = _.find(_.get(formErrors, crdsField), { index: this.crdIndex });

    if (crdErrors) {
      setSectionStatus('owned-crds', EDITOR_STATUS.errors);
    } else if (modified) {
      setSectionStatus('owned-crds', EDITOR_STATUS.modified);
    } else if (status !== EDITOR_STATUS.modified) {
      setSectionStatus('owned-crds', EDITOR_STATUS.all_good);
    }
  };

  /**
   * Some field changed so we need to update crd
   * @param {string} field
   * @param {*} value
   */
  updateCRD = (field, value) => {
    const { operator, storeEditorOperator } = this.props;
    const { crdTemplate } = this.state;

    let updatedOperator = _.cloneDeep(operator);
    const crd = this.getCrd();
    const updateTemplate = _.cloneDeep(crdTemplate || {});

    if (field === 'kind') {
      updateTemplate.kind = value;

      this.setState({ crdTemplate: updateTemplate });
      // push changed template to ALM examples
      updatedOperator = this.updateAlmTemplates(updatedOperator, updateTemplate);
    }

    // do not validate empty sample fields - they are stripped before export
    const updatedCrd = _.cloneDeep(crd);
    _.set(updatedCrd, field, value);

    // update the operator's version of this CRD
    const existingCRDs = _.get(updatedOperator, crdsField);

    if (this.crdIndex < 0) {
      existingCRDs.push(updatedCrd);
      this.crdIndex = 0;
    } else {
      _.set(updatedOperator, crdsField, [
        ...existingCRDs.slice(0, this.crdIndex),
        updatedCrd,
        ...existingCRDs.slice(this.crdIndex + 1)
      ]);
    }

    if (field === 'name') {
      // update reference name
      value !== this.originalName && this.updatePagePathOnNameChange(value);
    }

    storeEditorOperator(updatedOperator);

    this.validateField(field, updatedOperator);
  };

  validateField = (field, updatedOperator) => {
    const { formErrors, storeEditorFormErrors } = this.props;

    _.set(this.touchedFields, field, true);

    const errors = getUpdatedFormErrors(updatedOperator, formErrors, crdsField);
    storeEditorFormErrors(errors);
  };

  /**
   * Validate YAML examples and update operator
   */
  onTemplateYamlChange = yaml => {
    const { operator, storeEditorOperator } = this.props;
    const crd = this.getCrd();

    let crdTemplateYamlError = '';

    try {
      const template = safeLoad(yaml);
      const updatedOperator = this.updateAlmTemplates(_.cloneDeep(operator), template);

      storeEditorOperator(updatedOperator);

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
  updateAlmTemplates = (operator, template) => {
    const examples = _.get(operator, 'metadata.annotations.alm-examples');
    const crdTemplates = convertExampleYamlToObj(examples);
    const index = this.almExampleIndex;

    let updatedTemplates;

    if (index >= 0) {
      updatedTemplates = [...crdTemplates.slice(0, index), template, ...crdTemplates.slice(index + 1)];
    } else {
      updatedTemplates = [...crdTemplates, template];
      console.log('Something went wrong - cannot find alm example');
    }
    const updatedExamples = JSON.stringify(updatedTemplates);

    _.set(operator, 'metadata.annotations.alm-examples', updatedExamples);

    return operator;
  };

  updatePagePathOnNameChange = name => {
    const { history, isNew } = this.props;

    if (!isNew) {
      history.push(history.location.pathname.replace(this.originalName, name));
      this.originalName = name;
    }
  };

  onTemplateClear = () => {
    const crd = this.getCrd();

    const example = getDefaultAlmExample();
    example.kind = crd.kind || '';

    return safeDump(example);
  };

  setNameInputRef = ref => {
    this.nameInput = ref;
  };

  renderCRDInput = (title, field, fieldType, inputRefCallback?) => {
    const crd = this.getCrd();
    const crdErrors = this.getCrdErrors();

    // ignore errors on new CRDs for untouched fields

    const errors = !(this.isNewCRD && !_.get(this.touchedFields, field, false)) && crdErrors;

    if (fieldType === 'text-area') {
      return (
        <OperatorTextAreaUncontrolled
          field={field}
          title={title}
          defaultValue={_.get(crd, field, '')}
          formErrors={errors}
          commitField={this.updateCRD}
          refCallback={inputRefCallback}
          descriptions={crdDescriptions}
        />
      );
    }
    return (
      <OperatorInputUncontrolled
        field={field}
        title={title}
        defaultValue={_.get(crd, field, '')}
        inputType="text"
        formErrors={errors}
        commitField={this.updateCRD}
        refCallback={inputRefCallback}
        descriptions={crdDescriptions}
      />
    );
  };

  render() {
    const { history, match } = this.props;
    const {
      crdTemplate,
      crdTemplateYamlError,
      specDescriptorsExpandedByError,
      statusDescriptorsExpandedByError
    } = this.state;

    const crd = this.getCrd();
    const crdErrors = this.getCrdErrors();

    let crdTemplateYaml;

    if (crdTemplate) {
      try {
        crdTemplateYaml = safeDump(crdTemplate);
      } catch (e) {
        console.error(`Unable to convert alm-examples to YAML: ${e}`);
        crdTemplateYaml = '';
      }
    }

    let specDescriptors = _.get(crd, 'specDescriptors', []);
    let statusDescriptors = _.get(crd, 'statusDescriptors', []);

    if (specDescriptors.length === 0) {
      specDescriptors = [getDefaultCrdDescriptor()];
    }
    if (statusDescriptors.length === 0) {
      statusDescriptors = [getDefaultCrdDescriptor()];
    }
    return (
      <OperatorEditorSubPage
        title="Edit Owned CRD"
        tertiary
        lastPage="owned-crds"
        lastPageTitle="Owned CRDs"
        history={history}
        match={match}
        versionEditorRootPath={getVersionEditorRootPath(match)}
        validatePage={() => true}
      >
        <form className="oh-operator-editor-form">
          {this.renderCRDInput('Name', 'name', 'text', this.setNameInputRef)}
          {this.renderCRDInput('Display Name', 'displayName', 'text')}
          {this.renderCRDInput('Description', 'description', 'text-area')}
          {this.renderCRDInput('Kind', 'kind', 'text')}
          {this.renderCRDInput('Version', 'version', 'text')}
          <ResourcesEditor
            resources={_.get(crd, 'resources', [])}
            errors={_.get(crdErrors, 'resources')}
            onUpdate={resources => {
              this.updateCRD('resources', resources);
            }}
            title="Resources"
            field={`${crdsField}.resources`}
          />
          <div className="oh_operator-editor__crd-descriptors">
            <h3>SpecDescriptors and StatusDescriptors</h3>
            <p>{_.get(operatorFieldDescriptions, `${crdsField}.descriptors`)}</p>
            <DescriptorsEditor
              descriptors={specDescriptors}
              title="SpecDescriptors"
              singular="SpecDescriptor"
              descriptorsErrors={_.get(crdErrors, 'specDescriptors')}
              description="A reference to fields in the spec block of an object."
              expanded={specDescriptorsExpandedByError}
              onUpdate={value => {
                this.updateCRD('specDescriptors', value);
              }}
              descriptorOptions={SPEC_CAPABILITIES}
            />
            <DescriptorsEditor
              descriptors={statusDescriptors}
              title="StatusDescriptors"
              singular="StatusDescriptor"
              descriptorsErrors={_.get(crdErrors, 'statusDescriptors')}
              description="A reference to fields in the status block of an object."
              expanded={statusDescriptorsExpandedByError}
              onUpdate={value => {
                this.updateCRD('statusDescriptors', value);
              }}
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
  storeEditorOperator: noop,
  storeEditorFormErrors: noop,
  setSectionStatus: noop
};

const mapDispatchToProps = dispatch => bindActionCreators(OperatorOwnedCRDEditPageActions, dispatch);

const mapStateToProps = (state: StoreState) => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors,
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorOwnedCRDEditPage);
