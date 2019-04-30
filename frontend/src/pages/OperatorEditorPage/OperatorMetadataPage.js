import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import { categoryOptions, maturityOptions, operatorFieldPlaceholders } from '../../utils/operatorDescriptors';
import CapabilityEditor from '../../components/editor/CapabilityEditor';
import LabelsEditor from '../../components/editor/LabelsEditor';
import ImageEditor from '../../components/editor/ImageEditor';
import { renderOperatorFormField, getUpdatedFormErrors, EDITOR_STATUS, renderOperatorInput } from './editorPageUtils';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import DescriptionEditor from '../../components/editor/DescriptionEditor';
import EditorSelect from '../../components/editor/EditorSelect';

const METADATA_FIELDS = [
  'spec.displayName',
  'metadata.annotations.description',
  'spec.maturity',
  'spec.version',
  'spec.replaces',
  'spec.minKubeVersion',
  'spec.description',
  'metadata.annotations.capabilities',
  'spec.labels',
  'spec.selector.matchLabels',
  'metadata.annotations.categories',
  'spec.keywords',
  'spec.icon',
  'spec.links',
  'spec.provider.name',
  'spec.maintainers'
];

const metadataDescription = `
  The metadata section contains general metadata around the name, version, and other info that aids users in the
  discovery of your Operator.
  `;

class OperatorMetadataPage extends React.Component {
  state = {
    workingOperator: {}
  };

  constructor(props) {
    super(props);

    this.state = { workingOperator: _.cloneDeep(props.operator) };
  }

  componentDidUpdate(prevProps) {
    const { operator } = this.props;

    if (!_.isEqual(operator, prevProps.operator)) {
      this.setState({ workingOperator: _.cloneDeep(operator) });
    }
  }

  componentDidMount() {
    const { sectionStatus, formErrors, storeEditorFormErrors } = this.props;
    const { workingOperator } = this.state;

    this.originalStatus = sectionStatus.metadata;
    if (this.originalStatus !== EDITOR_STATUS.empty) {
      // ?? what it is supposed to do
      // eslint-disable-next-line no-undef
      updateStoredFormErrors(workingOperator, formErrors, METADATA_FIELDS, storeEditorFormErrors);
    }
  }

  updateOperator = (value, field) => {
    const { workingOperator } = this.state;
    _.set(workingOperator, field, value);
    this.forceUpdate();
  };

  validateField = field => {
    const { storeEditorOperator, formErrors, storeEditorFormErrors, setSectionStatus } = this.props;
    const { workingOperator } = this.state;

    const errors = getUpdatedFormErrors(workingOperator, formErrors, field);
    storeEditorFormErrors(errors);
    const metadataErrors = _.some(METADATA_FIELDS, metadataField => _.get(errors, metadataField));

    console.dir(errors);
    storeEditorOperator(_.cloneDeep(workingOperator));

    if (metadataErrors) {
      setSectionStatus(EDITOR_STATUS.errors);
    } else {
      setSectionStatus(EDITOR_STATUS.pending);
    }
  };

  validatePage = () => {
    const { formErrors, setSectionStatus } = this.props;

    const metadataErrors = _.some(METADATA_FIELDS, metadataField => _.get(formErrors, metadataField));
    if (metadataErrors) {
      this.originalStatus = EDITOR_STATUS.errors;
      setSectionStatus(EDITOR_STATUS.errors);
      return false;
    }

    return true;
  };

  updateOperatorImage = icon => {
    this.updateOperator(icon, 'spec.icon');
    this.validateField('spec.icon');
  };

  updateOperatorCapability = capability => {
    this.updateOperator(capability, 'metadata.annotations.capabilities');
    this.validateField('metadata.annotations.capabilities');
  };

  updateOperatorLabels = operatorLabels => {
    const labels = {};

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.key) || !_.isEmpty(operatorLabel.value)) {
        _.set(labels, operatorLabel.key, operatorLabel.value);
      }
    });
    this.updateOperator(labels, 'spec.labels');
    this.validateField('spec.labels');
  };

  updateOperatorSelectors = operatorLabels => {
    const matchLabels = {};

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.key) || !_.isEmpty(operatorLabel.value)) {
        _.set(matchLabels, operatorLabel.key, operatorLabel.value);
      }
    });
    this.updateOperator(matchLabels, 'spec.selector.matchLabels');
    this.validateField('spec.selector.matchLabels');
  };

  updateOperatorExternalLinks = operatorLabels => {
    const links = [];

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.name) && !_.isEmpty(operatorLabel.url)) {
        links.push(_.clone(operatorLabel));
      }
    });

    this.updateOperator(links, 'spec.links');
    this.validateField('spec.links');
  };

  updateOperatorMaintainers = operatorLabels => {
    const maintainers = [];

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.name) && !_.isEmpty(operatorLabel.email)) {
        maintainers.push(_.clone(operatorLabel));
      }
    });

    this.updateOperator(maintainers, 'spec.maintainers');
    this.validateField('spec.maintainers');
  };

  renderFormField = (title, field, fieldType) => {
    const { operator, formErrors } = this.props;
    const { workingOperator } = this.state;

    const errs = this.originalStatus === EDITOR_STATUS.empty && _.get(operator, field) === undefined ? {} : formErrors;

    return renderOperatorFormField(
      workingOperator,
      errs,
      this.updateOperator,
      this.validateField,
      title,
      field,
      fieldType
    );
  };

  renderMaturity = () => {
    const { formErrors } = this.props;
    const { workingOperator } = this.state;
    const field = 'spec.maturity';

    const maturity = _.get(workingOperator, field);
    const values = maturity ? [maturity] : [];

    const inputComponent = (
      <EditorSelect
        id={_.camelCase(field)}
        values={values}
        isMulti={false}
        noClear
        options={maturityOptions}
        placeholder={_.get(operatorFieldPlaceholders, field, `Select maturity`)}
        onChange={selection => {
          this.updateOperator(selection[0], field);
        }}
        onBlur={() => this.validateField(field)}
        filterBy={() => true}
      />
    );

    return renderOperatorInput('Maturity', field, inputComponent, formErrors);
  };

  renderCategories = () => {
    const { formErrors } = this.props;
    const { workingOperator } = this.state;
    const field = 'metadata.annotations.categories';

    const categories = _.get(workingOperator, field);
    const values = categories ? _.split(categories, ',') : [];

    const inputComponent = (
      <EditorSelect
        id={_.camelCase(field)}
        values={values}
        isMulti
        clearButton
        options={categoryOptions}
        placeholder={_.get(operatorFieldPlaceholders, field, `Select Categories`)}
        onChange={selections => {
          this.updateOperator(_.join(selections, ', '), field);
        }}
        onBlur={() => this.validateField(field)}
      />
    );

    return renderOperatorInput('Categories', field, inputComponent, formErrors);
  };

  renderKeywords = () => {
    const { formErrors } = this.props;
    const { workingOperator } = this.state;
    const field = 'spec.keywords';

    const inputComponent = (
      <EditorSelect
        id={_.camelCase(field)}
        values={_.get(workingOperator, field)}
        isMulti
        clearButton
        customSelect
        placeholder={_.get(operatorFieldPlaceholders, field, `Add Keywords`)}
        onChange={selections => {
          this.updateOperator(selections, field);
        }}
        onBlur={() => this.validateField(field)}
        newSelectionPrefix="Add keyword:"
        emptyLabel="Add keyword:"
      />
    );

    return renderOperatorInput('Keywords', field, inputComponent, formErrors);
  };

  renderMetadataFields = () => {
    const { formErrors } = this.props;
    const { workingOperator } = this.state;

    return (
      <form className="oh-operator-editor-form">
        {this.renderFormField('Name', 'metadata.name', 'text')}
        {this.renderFormField('Display Name', 'spec.displayName', 'text')}
        {this.renderFormField('Short Description', 'metadata.annotations.description', 'text-area')}
        {this.renderMaturity()}
        {this.renderFormField('Version', 'spec.version', 'text')}
        {this.renderFormField('Replaces (optional)', 'spec.replaces', 'text')}
        {this.renderFormField('Minimum Kubernetes Version (optional)', 'spec.minKubeVersion', 'text')}
        <DescriptionEditor
          operator={workingOperator}
          onUpdate={this.updateOperator}
          onValidate={this.validateField}
          formErrors={formErrors}
        />
        <CapabilityEditor operator={workingOperator} onUpdate={this.updateOperatorCapability} />
        <LabelsEditor
          operator={workingOperator}
          onUpdate={this.updateOperatorLabels}
          title="Labels"
          singular="Label"
          field="spec.labels"
          isPropsField
          formErrors={formErrors}
        />
        <LabelsEditor
          operator={workingOperator}
          onUpdate={this.updateOperatorSelectors}
          title="Selectors"
          singular="Selector"
          field="spec.selector.matchLabels"
          isPropsField
          formErrors={formErrors}
        />
        <h3>Categories and Keywords</h3>
        {this.renderCategories()}
        {this.renderKeywords()}
        <h3>Image Assets</h3>
        <ImageEditor onUpdate={this.updateOperatorImage} icon={_.get(workingOperator, 'spec.icon', [])[0]} />
        <LabelsEditor
          operator={workingOperator}
          onUpdate={this.updateOperatorExternalLinks}
          title="External Links"
          singular="External Link"
          field="spec.links"
          keyField="name"
          keyLabel="Name"
          keyPlaceholder="e.g. Blog"
          valueField="url"
          valueLabel="URL"
          valuePlaceholder="e.g. https://coreos.com/etcd"
          formErrors={formErrors}
        />
        <h3>Contact Information</h3>
        {this.renderFormField('Provider Name', 'spec.provider.name', 'text')}
        <LabelsEditor
          operator={workingOperator}
          onUpdate={this.updateOperatorMaintainers}
          title="Maintainers"
          singular="Maintainer"
          field="spec.maintainers"
          keyField="name"
          keyLabel="Name"
          keyPlaceholder="e.g. support"
          valueField="email"
          valueLabel="Email"
          valuePlaceholder="e.g. support@example.com"
          formErrors={formErrors}
        />
      </form>
    );
  };

  render() {
    const { formErrors, operator, history } = this.props;

    const metadataErrorFields = _.filter(METADATA_FIELDS, metadataField => _.get(formErrors, metadataField));
    const pageErrors = _.some(
      metadataErrorFields,
      errorField => this.originalStatus !== EDITOR_STATUS.empty || _.get(operator, errorField) !== undefined
    );

    return (
      <OperatorEditorSubPage
        title="Operator Metadata"
        description={metadataDescription}
        secondary
        history={history}
        section="metadata"
        pageErrors={pageErrors}
        validatePage={this.validatePage}
      >
        {this.renderMetadataFields()}
      </OperatorEditorSubPage>
    );
  }
}

OperatorMetadataPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  sectionStatus: PropTypes.object,
  setSectionStatus: PropTypes.func,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorMetadataPage.defaultProps = {
  operator: {},
  formErrors: {},
  sectionStatus: {},
  setSectionStatus: helpers.noop,
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
    }),
  setSectionStatus: status =>
    dispatch({
      type: reduxConstants.SET_EDITOR_SECTION_STATUS,
      section: 'metadata',
      status
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors,
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorMetadataPage);
