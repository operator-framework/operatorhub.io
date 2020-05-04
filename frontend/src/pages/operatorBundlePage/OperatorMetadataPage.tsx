import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash-es';

import { noop } from '../../common/helpers';
import { operatorObjectDescriptions } from '../../utils/operatorDescriptors';
import CapabilityEditor from '../../components/editor/CapabilityEditor';
import LabelsEditor from '../../components/editor/LabelsEditor';
import ImageEditor from '../../components/editor/ImageEditor';
import { getUpdatedFormErrors, getVersionEditorRootPath } from './bundlePageUtils';
import OperatorEditorSubPage from './subPage/OperatorEditorSubPage';
import DescriptionEditor from '../../components/editor/DescriptionEditor';
import {
  setSectionStatusAction,
  storeEditorFormErrorsAction,
  storeEditorOperatorAction
} from '../../redux/actions/editorActions';
import OperatorTextArea from '../../components/editor/forms/OperatorTextArea';
import OperatorInput from '../../components/editor/forms/OperatorInput';
import { containsErrors } from '../../utils/operatorValidation';
import { EDITOR_STATUS, sectionsFields, maturityOptions, categoryOptions, VersionEditorParamsMatch } from '../../utils/constants';
import OperatorSelect from '../../components/editor/forms/OperatorSelect';
import { StoreState } from '../../redux';
import { History } from 'history';
import { OperatorMaintainer, OperatorLink } from '../../utils/operatorTypes';

const OperatorMetadataPageActions = {
  storeEditorOperator: storeEditorOperatorAction,
  storeEditorFormErrors: storeEditorFormErrorsAction,
  setSectionStatus: status => setSectionStatusAction('metadata', status)
}

export type OperatorMetadataPageProps = {
  history: History,
  match: VersionEditorParamsMatch
} & ReturnType<typeof mapStateToProps> & typeof OperatorMetadataPageActions;

type OperatorMetadataPageState = {
  workingOperator: any
}

class OperatorMetadataPage extends React.Component<OperatorMetadataPageProps, OperatorMetadataPageState> {

  static propTypes;
  static defaultProps;

  state: OperatorMetadataPageState = {
    workingOperator: {}
  };

  originalStatus: string;

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
      const errors = getUpdatedFormErrors(workingOperator, formErrors, sectionsFields.metadata);
      storeEditorFormErrors(errors);
    }
  }

  updateOperator = (field, value) => {
    const { workingOperator } = this.state;
    _.set(workingOperator, field, value);
    this.forceUpdate();
  };

  validateFields = (fields, modified = true) => {
    const { sectionStatus, storeEditorOperator, formErrors, storeEditorFormErrors, setSectionStatus } = this.props;
    const { workingOperator } = this.state;

    const status = sectionStatus.metadata;
    const errors = getUpdatedFormErrors(workingOperator, formErrors, fields);
    storeEditorFormErrors(errors);
    const metadataErrors = _.some(sectionsFields.metadata, metadataField => _.get(errors, metadataField));

    console.dir(errors);
    storeEditorOperator(_.cloneDeep(workingOperator));

    if (metadataErrors) {
      setSectionStatus(EDITOR_STATUS.errors);
    } else if (modified) {
      setSectionStatus(EDITOR_STATUS.modified);
    } else if (status !== EDITOR_STATUS.modified) {
      setSectionStatus(EDITOR_STATUS.all_good);
    }
  };

  validatePage = () => {
    const { operator, formErrors, setSectionStatus, storeEditorFormErrors } = this.props;

    const fields = sectionsFields.metadata;
    const errors = getUpdatedFormErrors(operator, formErrors, fields);
    const metadataErrors = fields.some(field => _.get(errors, field));

    if (metadataErrors) {
      this.originalStatus = EDITOR_STATUS.errors;
      setSectionStatus(EDITOR_STATUS.errors);
      storeEditorFormErrors(errors);

      return false;
    }

    return true;
  };

  updateOperatorImage = icon => {
    this.updateOperator('spec.icon', icon);
    this.validateFields('spec.icon');
  };

  updateOperatorCapability = capability => {
    this.updateOperator('metadata.annotations.capabilities', capability);
    this.validateFields('metadata.annotations.capabilities');
  };

  updateOperatorLabels = operatorLabels => {
    const labels = {};

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.key) || !_.isEmpty(operatorLabel.value)) {
        labels[operatorLabel.key] = operatorLabel.value;
      }
    });
    this.updateOperator('spec.labels', labels);
    this.validateFields('spec.labels');
  };

  updateOperatorSelectors = operatorLabels => {
    const matchLabels = {};

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.key) || !_.isEmpty(operatorLabel.value)) {
        matchLabels[operatorLabel.key] = operatorLabel.value;
      }
    });
    this.updateOperator('spec.selector.matchLabels', matchLabels);
    this.validateFields('spec.selector.matchLabels');
  };

  updateOperatorExternalLinks = (operatorLabels: any[] = []) => {
    const links: OperatorLink[] = [];

    operatorLabels.forEach(operatorLabel => {
      if (!_.isEmpty(operatorLabel.name) && !_.isEmpty(operatorLabel.url)) {
        links.push(_.clone(operatorLabel));
      }
    });

    this.updateOperator('spec.links', links);
    this.validateFields('spec.links');
  };

  updateOperatorMaintainers = (operatorLabels: any[] = []) => {
    const maintainers: OperatorMaintainer[] = [];

    operatorLabels.forEach(operatorLabel => {
      if (!_.isEmpty(operatorLabel.name) && !_.isEmpty(operatorLabel.email)) {
        maintainers.push(_.clone(operatorLabel));
      }
    });

    this.updateOperator('spec.maintainers', maintainers);
    this.validateFields(['spec.maintainers', 'spec.provider.name']);
  };

  renderFormField = (title, field, fieldType) => {
    const { formErrors } = this.props;
    const { workingOperator } = this.state;

    if (fieldType === 'text-area') {
      return (
        <OperatorTextArea
          title={title}
          field={field}
          formErrors={formErrors}
          value={_.get(workingOperator, field, '')}
          updateOperator={this.updateOperator}
          commitField={fields => this.validateFields(fields)}
        />
      );
    }
    return (
      <OperatorInput
        title={title}
        field={field}
        formErrors={formErrors}
        value={_.get(workingOperator, field, '')}
        inputType={fieldType}
        updateOperator={this.updateOperator}
        commitField={fields => this.validateFields(fields)}
      />
    );
  };

  validateProviderName = () => {
    // validate both fields as they are interconnected
    this.validateFields(['spec.maintainers', 'spec.provider.name']);
  };

  getMaturityValues() {
    const { workingOperator } = this.state;

    const maturity = _.get(workingOperator, 'spec.maturity');
    return maturity ? [maturity] : [];
  }

  getCategoriesValues() {
    const { workingOperator } = this.state;

    const categories = _.get(workingOperator, 'metadata.annotations.categories');
    return categories ? categories.split(',') : [];
  }

  render() {
    const { formErrors, history, sectionStatus, match } = this.props;
    const { workingOperator } = this.state;

    const metadataErrorFields = sectionsFields.metadata.filter(metadataField => _.get(formErrors, metadataField));
    // mark pristine page
    const pageErrors = sectionStatus.metadata === EDITOR_STATUS.empty || containsErrors(metadataErrorFields);

    return (
      <OperatorEditorSubPage
        title="Operator Metadata"
        description={operatorObjectDescriptions.metadata.description}
        versionEditorRootPath={getVersionEditorRootPath(match)}
        secondary
        match={match}
        history={history}
        section="metadata"
        pageErrors={pageErrors}
        validatePage={this.validatePage}
      >
        <form className="oh-operator-editor-form">
          {this.renderFormField('Name', 'metadata.name', 'text')}
          {this.renderFormField('Display Name', 'spec.displayName', 'text')}
          {this.renderFormField('Short Description', 'metadata.annotations.description', 'text-area')}
          <OperatorSelect
            title="Maturity"
            field="spec.maturity"
            isMulti={false}
            values={this.getMaturityValues()}
            options={maturityOptions}
            formErrors={formErrors}
            updateOperator={(field, values) => this.updateOperator(field, values[0] || '')}
            commitField={this.validateFields}
          />
          {this.renderFormField('Version', 'spec.version', 'text')}
          {this.renderFormField('Replaces (optional)', 'spec.replaces', 'text')}
          {this.renderFormField('Minimum Kubernetes Version (optional)', 'spec.minKubeVersion', 'text')}
          <DescriptionEditor
            operator={workingOperator}
            onUpdate={(value, field) => this.updateOperator(field, value)}
            onValidate={this.validateFields}
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
          <OperatorSelect
            title="Categories"
            field="metadata.annotations.categories"
            formErrors={formErrors}
            values={this.getCategoriesValues()}
            options={categoryOptions}
            isMulti
            updateOperator={(field, values) => {
              this.updateOperator(field, values.join(', '));
            }}
            commitField={this.validateFields}
          />
          <OperatorSelect
            title="Keywords"
            field="spec.keywords"
            formErrors={formErrors}
            values={_.get(workingOperator, 'spec.keywords')}
            isMulti
            options={[]}
            customSelect
            newSelectionPrefix="Add keyword: "
            updateOperator={this.updateOperator}
            commitField={this.validateFields}
          />
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
          <OperatorInput
            field="spec.provider.name"
            title="Provider Name"
            inputType="text"
            value={_.get(workingOperator, 'spec.provider.name', '')}
            formErrors={formErrors}
            updateOperator={this.updateOperator}
            commitField={this.validateProviderName}
          />
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
  setSectionStatus: noop,
  storeEditorFormErrors: noop,
  storeEditorOperator: noop
};

const mapDispatchToProps = dispatch => bindActionCreators(OperatorMetadataPageActions, dispatch);

const mapStateToProps = (state: StoreState) => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors,
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorMetadataPage);
