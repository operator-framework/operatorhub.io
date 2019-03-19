import * as React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import * as _ from 'lodash-es';
import { Breadcrumb } from 'patternfly-react';

import { helpers } from '../../common/helpers';
import Page from '../../components/page/Page';
import { reduxConstants } from '../../redux';
import { getFieldValueError } from '../../utils/operatorUtils';
import { categoryOptions } from '../../utils/operatorDescriptors';
import CapabilityEditor from '../../components/editor/CapabilityEditor';
import LabelsEditor from '../../components/editor/LabelsEditor';
import ImageEditor from '../../components/editor/ImageEditor';
import { renderOperatorFormField } from './editorPageUtils';

class OperatorMetadataPage extends React.Component {
  state = {
    headerHeight: 0,
    titleHeight: 0
  };

  componentDidMount() {
    this.updateTitleHeight();
    this.onWindowResize = helpers.debounce(this.updateTitleHeight, 100);
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onScroll = (scrollTop, topperHeight, toolbarHeight) => {
    const { headerHeight } = this.state;
    if (headerHeight !== topperHeight + toolbarHeight) {
      this.setState({ headerHeight: topperHeight + toolbarHeight });
    }
  };

  updateTitleHeight = () => {
    this.setState({ titleHeight: this.titleAreaRef.scrollHeight });
  };

  onHome = e => {
    e.preventDefault();
    this.props.history.push('/');
  };

  onBack = e => {
    e.preventDefault();
    this.props.history.push('/editor');
  };

  onSearchChange = searchValue => {
    this.setState({ keywordSearch: searchValue });
  };

  clearSearch = () => {
    this.onSearchChange('');
  };

  searchCallback = searchValue => {
    if (searchValue) {
      this.props.storeKeywordSearch(searchValue);
      this.props.history.push(`/?keyword=${searchValue}`);
    }
  };

  operatorUpdated = () => {
    const { operator, storeEditorOperator } = this.props;

    storeEditorOperator(operator);
  };

  updateOperator = (value, field) => {
    const { operator, storeEditorOperator } = this.props;

    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, field, value);
    storeEditorOperator(updatedOperator);
  };

  validateField = field => {
    const { operator, formErrors, storeEditorFormErrors } = this.props;

    const error = getFieldValueError(operator, field);
    _.set(formErrors, field, error);
    storeEditorFormErrors(formErrors);
  };

  updateOperatorCapability = capability => {
    this.updateOperator(capability, 'metadata.annotations.capabilities');
    this.validateField('metadata.annotations.capabilities');
  };

  updateOperatorLabels = operatorLabels => {
    const labels = {};

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.key) && !_.isEmpty(operatorLabel.value)) {
        _.set(labels, operatorLabel.key, operatorLabel.value);
      }
    });
    this.updateOperator(labels, 'spec.labels');
    this.validateField('spec.labels');
  };

  updateOperatorSelectors = operatorLabels => {
    const matchLabels = {};

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.key) && !_.isEmpty(operatorLabel.value)) {
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

  renderFormField(title, field, fieldType, options) {
    const { operator, formErrors } = this.props;

    return renderOperatorFormField(
      operator,
      formErrors,
      this.updateOperator,
      this.validateField,
      title,
      field,
      fieldType,
      options
    );
  }

  setTitleAreaRef = ref => {
    this.titleAreaRef = ref;
  };

  renderMetadataFields() {
    const { operator } = this.props;

    const fields = [
      'spec.displayName',
      'metadata.annotations.description',
      'spec.description',
      'spec.maturity',
      'spec.version',
      'spec.replaces',
      'spec.MinKubeVersion',
      'metadata.annotations.capabilities',
      'spec.installModes',
      'spec.labels',
      'spec.selector.matchLabels',
      'metadata.annotations.categories',
      'spec.keywords',
      'spec.icon'
    ];

    return (
      <form className="oh-operator-editor-form">
        {this.renderFormField('Display Name', 'spec.displayName', 'text')}
        {this.renderFormField('Short Description', 'metadata.annotations.description', 'text-area')}
        {this.renderFormField('Long Description', 'spec.description', 'text-area', 5)}
        {this.renderFormField('Maturity', 'spec.maturity', 'text')}
        {this.renderFormField('Version', 'spec.version', 'text')}
        {this.renderFormField('Replaces', 'spec.replaces', 'text')}
        {this.renderFormField('Minimum Kubernetes Version', 'spec.MinKubeVersion', 'text')}
        <CapabilityEditor operator={operator} onUpdate={this.updateOperatorCapability} />
        <LabelsEditor
          operator={operator}
          onUpdate={this.updateOperatorLabels}
          title="Labels (optional)"
          field="spec.labels"
        />
        <LabelsEditor
          operator={operator}
          onUpdate={this.updateOperatorSelectors}
          title="Selectors (optional)"
          field="spec.selector.matchLabels"
        />
        <h3>Categories and Keywords</h3>
        {this.renderFormField('Categories', 'metadata.annotations.categories', 'multi-select', categoryOptions)}
        {this.renderFormField('Keywords', 'spec.keywords', 'text')}
        <h3>Image Assets</h3>
        <ImageEditor onUpdate={this.operatorUpdated} operator={operator} />
        <LabelsEditor
          operator={operator}
          onUpdate={this.updateOperatorExternalLinks}
          title="External Links"
          field="spec.links"
          keyField="name"
          keyLabel="Name"
          keyPlaceholder="e.g. Blog"
          valueField="url"
          valueLabel="URL"
          valuePlaceholder="e.g. https://coreos.com/etcd"
        />
        <h3>Contact Information</h3>
        {this.renderFormField('Provider Name', 'spec.provider.name', 'text')}
        <LabelsEditor
          operator={operator}
          onUpdate={this.updateOperatorMaintainers}
          title="Maintainers"
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
  }

  render() {
    const { keywordSearch, headerHeight, titleHeight } = this.state;

    const toolbarContent = (
      <Breadcrumb>
        <Breadcrumb.Item onClick={e => this.onHome(e)} href={window.location.origin}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item onClick={e => this.onBack(e)} href={`${window.location.origin}/Operator Editor`}>
          Operator Editor
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Operator Metadata</Breadcrumb.Item>
      </Breadcrumb>
    );

    return (
      <Page
        className="oh-page-operator-editor"
        toolbarContent={toolbarContent}
        history={this.props.history}
        searchValue={keywordSearch}
        onSearchChange={this.onSearchChange}
        clearSearch={this.clearSearch}
        searchCallback={this.searchCallback}
        scrollCallback={this.onScroll}
      >
        <div className="oh-operator-editor-page">
          <div className="oh-operator-editor-page__title-area" ref={this.setTitleAreaRef} style={{ top: headerHeight }}>
            <div className="oh-operator-editor-page__title-area__inner">
              <h1>Operator Metadata</h1>
              <p>
                The metadata section contains general metadata around the name, version, and other info that aids users
                in discovery of your Operator.
              </p>
            </div>
          </div>
          <div className="oh-operator-editor-page__page-area" style={{ marginTop: titleHeight || 0 }}>
            {this.renderMetadataFields()}
          </div>
        </div>
      </Page>
    );
  }
}

OperatorMetadataPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  storeKeywordSearch: PropTypes.func
};

OperatorMetadataPage.defaultProps = {
  operator: {},
  formErrors: {},
  storeEditorFormErrors: helpers.noop,
  storeEditorOperator: helpers.noop,
  storeKeywordSearch: helpers.noop
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
  storeKeywordSearch: keywordSearch =>
    dispatch({
      type: reduxConstants.SET_KEYWORD_SEARCH,
      keywordSearch
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
