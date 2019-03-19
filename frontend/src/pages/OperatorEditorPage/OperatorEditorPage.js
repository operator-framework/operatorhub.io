import * as React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import * as _ from 'lodash-es';
import { safeLoad, safeDump } from 'js-yaml';
import { Alert, Breadcrumb, EmptyState, Icon } from 'patternfly-react';
import { helpers } from '../../common/helpers';
import Page from '../../components/page/Page';
import { reduxConstants } from '../../redux';
import YamlEditor from '../../components/YamlViewer';
import { validateOperator } from '../../utils/operatorUtils';
import PreviewOperatorModal from '../../components/modals/PreviewOperatorModal';
import EditorSection from '../../components/editor/EditorSection';
import ManifestUploader from '../../components/editor/ManifestUploader';
import { operatorFieldDescriptions } from '../../utils/operatorDescriptors';

class OperatorEditorPage extends React.Component {
  state = {
    validCSV: false,
    previewShown: false,
    headerHeight: 0,
    titleHeight: 0,
    uploadExpanded: false
  };

  componentDidMount() {
    const { operator } = this.props;

    this.setState({
      validCSV: validateOperator(operator)
    });

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

  onYamlChange = yaml => {
    let updatedOperator = {};
    try {
      updatedOperator = safeLoad(yaml) || {};
    } catch (e) {
      // Ignore errors until save
    }

    const validCSV = validateOperator(updatedOperator);
    this.props.storeEditorOperator(updatedOperator);
    this.setState({ operatorYaml: yaml, validCSV });
  };

  generateCSV = () => {};

  hidePreviewOperator = () => {
    this.setState({ previewShown: false });
  };

  showPreviewOperator = () => {
    this.setState({ previewShown: true });
  };

  toggleUploadExpanded = event => {
    event.preventDefault();
    this.setState({ uploadExpanded: !this.state.uploadExpanded });
  };

  doClearContents = () => {
    const { storeEditorYaml, storeEditorFormErrors, storeEditorOperator, hideConfirmModal } = this.props;
    storeEditorYaml('');
    storeEditorFormErrors({});
    storeEditorOperator({});
    this.setState({
      operatorYaml: '',
      yamlError: '',
      validCSV: false
    });
    hideConfirmModal();
  };

  clearContents = () => {
    const { showConfirmModal } = this.props;
    showConfirmModal(this.doClearContents);
  };

  updateOperatorFromManifests = operator => {
    const { storeEditorOperator } = this.props;

    console.dir(operator);
    const validCSV = validateOperator(operator);

    this.setState({ validCSV });
    storeEditorOperator(operator);
  };

  toggleEditMode = () => {
    const { operator, editMode, storeEditorOperator } = this.props;
    const { operatorYaml } = this.state;

    if (editMode === 'form') {
      try {
        const updatedOperatorYaml = !_.isEmpty(operator) ? safeDump(operator) : '';
        this.setState({ operatorYaml: updatedOperatorYaml });
        this.props.storeEditMode('yaml');
      } catch (e) {
        this.setState({ yamlError: e.message });
      }
      return;
    }

    try {
      const updatedOperator = safeLoad(operatorYaml) || {};
      storeEditorOperator(updatedOperator);
      this.props.storeEditMode('form');
    } catch (e) {
      this.setState({ yamlError: e.message });
    }
  };

  renderYamlEditor() {
    const { operatorYaml, yamlError } = this.state;

    return (
      <div className="oh-preview-page-yaml">
        <YamlEditor onChange={this.onYamlChange} editable yaml={operatorYaml} error={yamlError} />
      </div>
    );
  }

  setTitleAreaRef = ref => {
    this.titleAreaRef = ref;
  };

  renderMetadataSection() {
    const { operator, history } = this.props;

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
      <EditorSection
        operator={operator}
        fields={fields}
        title="Operator Metadata"
        description="The metadata section contains general metadata around the name, version, and other info that aids users in discovery of your Operator."
        history={history}
        sectionLocation="metadata"
      />
    );
  }

  renderGeneralInfo() {
    return (
      <React.Fragment>
        <h2>General Info</h2>
        {this.renderMetadataSection()}
      </React.Fragment>
    );
  }

  renderOwnedCRDs = () => {
    const { operator, history } = this.props;
    const fields = [];
    return (
      <EditorSection
        operator={operator}
        fields={fields}
        title="Owned CRDs"
        description={_.get(operatorFieldDescriptions, 'spec.customresourcedefinitions.owned')}
        history={history}
        sectionLocation="owned-crds"
      />
    );
  };

  renderRequiredCRDs = () => {
    const { operator, history } = this.props;
    const fields = [];
    return (
      <EditorSection
        operator={operator}
        fields={fields}
        title="Required CRDs (Optional)"
        description={_.get(operatorFieldDescriptions, 'spec.customresourcedefinitions.required')}
        history={history}
        sectionLocation="required-crds"
      />
    );
  };

  renderCustomResourceDefinitions() {
    return (
      <React.Fragment>
        <h2>Custom Resource Definitions</h2>
        {this.renderOwnedCRDs()}
        {this.renderRequiredCRDs()}
      </React.Fragment>
    );
  }

  renderDeployments = () => {
    const { operator, history } = this.props;
    const fields = [];
    return (
      <EditorSection
        operator={operator}
        fields={fields}
        title="Deployments"
        description={_.get(operatorFieldDescriptions, 'spec.install.spec.deployments')}
        history={history}
        sectionLocation="deployments"
      />
    );
  };

  renderPermissions = () => {
    const { operator, history } = this.props;
    const fields = [];
    return (
      <EditorSection
        operator={operator}
        fields={fields}
        title="Permissions"
        description={_.get(operatorFieldDescriptions, 'spec.install.spec.permissions')}
        history={history}
        sectionLocation="permissions"
      />
    );
  };

  renderInstallModes = () => {
    const { operator, history } = this.props;
    const fields = [];
    return (
      <EditorSection
        operator={operator}
        fields={fields}
        title="Install Modes"
        description={operatorFieldDescriptions.spec.installModes}
        history={history}
        sectionLocation="install-modes"
      />
    );
  };

  renderOperatorInstallation() {
    return (
      <React.Fragment>
        <h2>Installation and Permissions</h2>
        {this.renderDeployments()}
        {this.renderPermissions()}
        {this.renderInstallModes()}
      </React.Fragment>
    );
  }

  renderManifests() {
    const { operator } = this.props;
    const { uploadExpanded } = this.state;

    return (
      <React.Fragment>
        <div className="oh-operator-editor-page__section">
          <div className="oh-operator-editor-page__section__header">
            <div className="oh-operator-editor-page__section__header__text">
              <h2>Upload your operator manifests</h2>
              <p>
                The CRDs, deployments, or RBAC related objects defined in those manifests will be used to populate
                fields in the CSV file. YOu can also upload an existing CSV file. Alternatively, you can simply fill in
                the form entries below.
              </p>
            </div>
            <div className="oh-operator-editor-page__section__status">
              {uploadExpanded ? (
                <a onClick={e => this.toggleUploadExpanded(e)}>
                  <Icon type="fa" name="compress" />
                  Collapse
                </a>
              ) : (
                <a onClick={e => this.toggleUploadExpanded(e)}>
                  <Icon type="fa" name="expand" />
                  Expand
                </a>
              )}
            </div>
          </div>
          {uploadExpanded && <ManifestUploader operator={operator} onUpdate={this.updateOperatorFromManifests} />}
        </div>
      </React.Fragment>
    );
  }

  renderError() {
    const { yamlError } = this.state;

    return (
      <div id="yaml-editor-error">
        {yamlError && (
          <EmptyState className="blank-slate-content-pf">
            <Alert type="error">
              <span>{`Error parsing YAML: ${yamlError}`}</span>
            </Alert>
          </EmptyState>
        )}
      </div>
    );
  }

  renderOperatorForm() {
    return (
      <form className="oh-operator-editor-form">
        {this.renderGeneralInfo()}
        {this.renderCustomResourceDefinitions()}
        {this.renderOperatorInstallation()}
      </form>
    );
  }

  renderHeader = () => (
    <div className="oh-operator-editor-page__title-area__inner">
      <div className="oh-operator-editor-page__header">
        <h1>Build the Cluster Service Version (CSV) for your Operator</h1>
      </div>
      <p>
        This editor is aimed to assist in creating and editing a Cluster Service Version (CSV) for your operator. Start
        by uploading your operator manifests for deployments, RBAC, CRDs, or an existing ClusterServiceVersion file. The
        forms below will be populated with all valid information and used to create the CSV file for your operator.
      </p>
    </div>
  );

  renderButtonBar() {
    const { operatorYaml, validCSV } = this.state;
    return (
      <div className="oh-operator-editor-page__button-bar">
        <div>
          <button
            className={`oh-operator-editor-toolbar__button ${operatorYaml ? '' : 'disabled'}`}
            disabled={!operatorYaml}
            onClick={this.clearContents}
          >
            Clear Content
          </button>
        </div>
        <div>
          <button
            className={`oh-operator-editor-toolbar__button ${validCSV ? '' : 'disabled'}`}
            disabled={!validCSV}
            onClick={this.showPreviewOperator}
          >
            Preview
          </button>
          <button
            className={`oh-operator-editor-toolbar__button primary ${validCSV ? '' : 'disabled'}`}
            disabled={!validCSV}
            onClick={this.generateCSV}
          >
            Generate
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { operator, editMode } = this.props;
    const { previewShown, keywordSearch, headerHeight, titleHeight } = this.state;

    const toolbarContent = (
      <Breadcrumb>
        <Breadcrumb.Item onClick={e => this.onHome(e)} href={window.location.origin}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Operator Editor</Breadcrumb.Item>
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
            {this.renderHeader()}
          </div>
          <div className="oh-operator-editor-page__page-area" style={{ marginTop: titleHeight || 0 }}>
            {this.renderManifests()}
            {editMode === 'form' && (
              <React.Fragment>
                {this.renderGeneralInfo()}
                {this.renderCustomResourceDefinitions()}
                {this.renderOperatorInstallation()}
              </React.Fragment>
            )}
            {editMode === 'yaml' && this.renderYamlEditor()}
            {this.renderButtonBar()}
          </div>
        </div>
        <PreviewOperatorModal show={previewShown} yamlOperator={operator} onClose={this.hidePreviewOperator} />
      </Page>
    );
  }
}

OperatorEditorPage.propTypes = {
  operator: PropTypes.object,
  editMode: PropTypes.string,
  storeEditMode: PropTypes.func,
  storeEditorOperator: PropTypes.func,
  storeEditorYaml: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  showConfirmModal: PropTypes.func,
  hideConfirmModal: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  storeKeywordSearch: PropTypes.func
};

OperatorEditorPage.defaultProps = {
  operator: {},
  editMode: 'form',
  storeEditMode: helpers.noop,
  storeEditorFormErrors: helpers.noop,
  storeEditorOperator: helpers.noop,
  storeEditorYaml: helpers.noop,
  showConfirmModal: helpers.noop,
  hideConfirmModal: helpers.noop,
  storeKeywordSearch: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  storeEditMode: mode =>
    dispatch({
      type: reduxConstants.SET_EDITOR_MODE,
      mode
    }),
  storeEditorYaml: (yaml, yamlChanged = true) =>
    dispatch({
      type: reduxConstants.SET_EDITOR_YAML,
      yaml,
      yamlChanged
    }),
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
  showConfirmModal: onConfirm =>
    dispatch({
      type: reduxConstants.CONFIRMATION_MODAL_SHOW,
      title: 'Clear Content',
      heading: <span>Are you sure you want to clear the current content of the editor?</span>,
      confirmButtonText: 'Clear',
      cancelButtonText: 'Cancel',
      onConfirm
    }),
  hideConfirmModal: () =>
    dispatch({
      type: reduxConstants.CONFIRMATION_MODAL_HIDE
    }),
  storeKeywordSearch: keywordSearch =>
    dispatch({
      type: reduxConstants.SET_KEYWORD_SEARCH,
      keywordSearch
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors,
  editMode: state.editorState.mode
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorEditorPage);
