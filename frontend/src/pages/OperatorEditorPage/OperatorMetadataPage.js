import * as React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import { getFieldValueError } from '../../utils/operatorUtils';
import { categoryOptions } from '../../utils/operatorDescriptors';
import CapabilityEditor from '../../components/editor/CapabilityEditor';
import LabelsEditor from '../../components/editor/LabelsEditor';
import ImageEditor from '../../components/editor/ImageEditor';
import { renderOperatorFormField } from './editorPageUtils';
import OperatorEditorSubPage from './OperatorEditorSubPage';

const metadataDescription = `
  The metadata section contains general metadata around the name, version, and other info that aids users in the
  discovery of your Operator.
  `;

const OperatorMetadataPage = ({ operator, formErrors, storeEditorOperator, storeEditorFormErrors, history }) => {
  const operatorUpdated = () => {
    storeEditorOperator(operator);
  };

  const updateOperator = (value, field) => {
    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, field, value);
    storeEditorOperator(updatedOperator);
  };

  const validateField = field => {
    const error = getFieldValueError(operator, field);
    _.set(formErrors, field, error);
    storeEditorFormErrors(formErrors);
  };

  const updateOperatorCapability = capability => {
    updateOperator(capability, 'metadata.annotations.capabilities');
    validateField('metadata.annotations.capabilities');
  };

  const updateOperatorLabels = operatorLabels => {
    const labels = {};

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.key) && !_.isEmpty(operatorLabel.value)) {
        _.set(labels, operatorLabel.key, operatorLabel.value);
      }
    });
    updateOperator(labels, 'spec.labels');
    validateField('spec.labels');
  };

  const updateOperatorSelectors = operatorLabels => {
    const matchLabels = {};

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.key) && !_.isEmpty(operatorLabel.value)) {
        _.set(matchLabels, operatorLabel.key, operatorLabel.value);
      }
    });
    updateOperator(matchLabels, 'spec.selector.matchLabels');
    validateField('spec.selector.matchLabels');
  };

  const updateOperatorExternalLinks = operatorLabels => {
    const links = [];

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.name) && !_.isEmpty(operatorLabel.url)) {
        links.push(_.clone(operatorLabel));
      }
    });

    updateOperator(links, 'spec.links');
    validateField('spec.links');
  };

  const updateOperatorMaintainers = operatorLabels => {
    const maintainers = [];

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.name) && !_.isEmpty(operatorLabel.email)) {
        maintainers.push(_.clone(operatorLabel));
      }
    });

    updateOperator(maintainers, 'spec.maintainers');
    validateField('spec.maintainers');
  };

  const renderFormField = (title, field, fieldType, options) =>
    renderOperatorFormField(operator, formErrors, updateOperator, validateField, title, field, fieldType, options);

  const renderMetadataFields = () => (
    // const fields = [
    //   'spec.displayName',
    //   'metadata.annotations.description',
    //   'spec.description',
    //   'spec.maturity',
    //   'spec.version',
    //   'spec.replaces',
    //   'spec.MinKubeVersion',
    //   'metadata.annotations.capabilities',
    //   'spec.installModes',
    //   'spec.labels',
    //   'spec.selector.matchLabels',
    //   'metadata.annotations.categories',
    //   'spec.keywords',
    //   'spec.icon'
    // ];
    <form className="oh-operator-editor-form">
      {renderFormField('Display Name', 'spec.displayName', 'text')}
      {renderFormField('Short Description', 'metadata.annotations.description', 'text-area')}
      {renderFormField('Long Description', 'spec.description', 'text-area', 5)}
      {renderFormField('Maturity', 'spec.maturity', 'text')}
      {renderFormField('Version', 'spec.version', 'text')}
      {renderFormField('Replaces', 'spec.replaces', 'text')}
      {renderFormField('Minimum Kubernetes Version', 'spec.MinKubeVersion', 'text')}
      <CapabilityEditor operator={operator} onUpdate={updateOperatorCapability} />
      <LabelsEditor
        operator={operator}
        onUpdate={updateOperatorLabels}
        title="Labels (optional)"
        singular="Label"
        field="spec.labels"
      />
      <LabelsEditor
        operator={operator}
        onUpdate={updateOperatorSelectors}
        title="Selectors (optional)"
        singular="Selector"
        field="spec.selector.matchLabels"
      />
      <h3>Categories and Keywords</h3>
      {renderFormField('Categories', 'metadata.annotations.categories', 'multi-select', categoryOptions)}
      {renderFormField('Keywords', 'spec.keywords', 'text')}
      <h3>Image Assets</h3>
      <ImageEditor onUpdate={operatorUpdated} operator={operator} />
      <LabelsEditor
        operator={operator}
        onUpdate={updateOperatorExternalLinks}
        title="External Links"
        singular="External Link"
        field="spec.links"
        keyField="name"
        keyLabel="Name"
        keyPlaceholder="e.g. Blog"
        valueField="url"
        valueLabel="URL"
        valuePlaceholder="e.g. https://coreos.com/etcd"
      />
      <h3>Contact Information</h3>
      {renderFormField('Provider Name', 'spec.provider.name', 'text')}
      <LabelsEditor
        operator={operator}
        onUpdate={updateOperatorMaintainers}
        title="Maintainers"
        singular="Maintainer"
        field="spec.maintainers"
        keyField="name"
        keyLabel="Name"
        keyPlaceholder="e.g. support"
        valueField="email"
        valueLabel="Email"
        valuePlaceholder="e.g. support@example.com"
      />
    </form>
  );

  return (
    <OperatorEditorSubPage title="Operator Metadata" description={metadataDescription} secondary history={history}>
      {renderMetadataFields()}
    </OperatorEditorSubPage>
  );
};

OperatorMetadataPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorMetadataPage.defaultProps = {
  operator: {},
  formErrors: {},
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
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorMetadataPage);
