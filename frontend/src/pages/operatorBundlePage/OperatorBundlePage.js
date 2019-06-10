import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import JSZip from 'jszip';
import { Icon } from 'patternfly-react';
import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import EditorSection from '../../components/editor/EditorSection';
import ManifestUploader from '../../components/editor/manfiestUploader/ManifestUploader';
import { operatorFieldDescriptions, operatorObjectDescriptions } from '../../utils/operatorDescriptors';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import PreviewOperatorModal from '../../components/modals/PreviewOperatorModal';
import { EDITOR_STATUS, operatorNameFromOperator, yamlFromOperator } from './bundlePageUtils';
import { defaultOperator, validateOperator, removeEmptyOptionalValuesFromOperator } from '../../utils/operatorUtils';

class OperatorBundlePage extends React.Component {
  state = {
    uploadExpanded: false,
    validCSV: false,
    sectionsValid: false,
    previewShown: false
  };

  componentDidMount() {
    const { operator, sectionStatus } = this.props;
    const sectionsValid = _.every(_.keys(sectionStatus), key => sectionStatus[key] === EDITOR_STATUS.complete);
    this.setState({ validCSV: validateOperator(operator), sectionsValid });
  }

  componentDidUpdate(prevProps) {
    const { operator, sectionStatus } = this.props;
    if (!_.isEqual(operator, prevProps.operator)) {
      this.setState({ validCSV: validateOperator(operator) });
    }
    if (!_.isEqual(sectionStatus, prevProps.sectionStatus)) {
      const sectionsValid = _.every(_.keys(sectionStatus), key => sectionStatus[key] === EDITOR_STATUS.complete);
      this.setState({ sectionsValid });
    }
  }

  toggleUploadExpanded = event => {
    event.preventDefault();
    this.setState({ uploadExpanded: !this.state.uploadExpanded });
  };

  onEditCSVYaml = e => {
    e.preventDefault();
    this.props.history.push('/bundle/yaml');
  };

  generateCSV = () => {
    const { operator } = this.props;

    // remove values which are part of default operator, but are invalid
    const cleanedOperator = removeEmptyOptionalValuesFromOperator(operator);

    let operatorYaml;
    try {
      operatorYaml = yamlFromOperator(cleanedOperator);
    } catch (e) {
      operatorYaml = '';
    }

    const name = operatorNameFromOperator(cleanedOperator);

    const zip = new JSZip();
    zip.file(`${name}/${name}.clusterserviceversion.yaml`, operatorYaml);

    zip.generateAsync({ type: 'base64' }).then(
      base64 => {
        this.generateAction.href = `data:application/zip;base64,${base64}`;
        this.generateAction.download = `${_.get(cleanedOperator, 'spec.displayName')}.bundle.zip`;
        this.generateAction.click();
      },
      err => {
        console.error(err);
      }
    );
  };

  hidePreviewOperator = () => {
    this.setState({ previewShown: false });
  };

  showPreviewOperator = () => {
    this.setState({ previewShown: true });
  };

  doClearContents = () => {
    const { resetEditorOperator, hideConfirmModal } = this.props;
    resetEditorOperator();
    this.setState({
      validCSV: false
    });
    hideConfirmModal();
  };

  clearContents = () => {
    const { showConfirmModal } = this.props;
    showConfirmModal(this.doClearContents);
  };

  setGenerateAction = ref => {
    this.generateAction = ref;
  };

  renderHeader = () => (
    <React.Fragment>
      <div className="oh-operator-editor-page__header">
        <h1>Create your Operator Bundle</h1>
      </div>
      <p>
        This page will assist you in the creation or modification of your Operator bundle. Start by uploading your
        Kubernetes manifest files. The forms below will be populated with all valid information and used to create the
        new Operator bundle. You can modify or add properties through these forms as well.
      </p>
    </React.Fragment>
  );

  renderButtonBar() {
    const { operator } = this.props;
    const { validCSV, sectionsValid } = this.state;

    const isDefault = _.isEqual(operator, defaultOperator);
    const okToDownload = validCSV && sectionsValid;

    const downloadClasses = classNames('oh-button oh-button-primary', { disabled: !okToDownload });
    const clearClasses = classNames('oh-button oh-button-secondary', { disabled: isDefault });

    return (
      <div className="oh-operator-editor-page__button-bar">
        <div>
          <button className={downloadClasses} disabled={!okToDownload} onClick={this.generateCSV}>
            Download Operator Bundle
          </button>
          <button className="oh-button oh-button-secondary" onClick={this.onEditCSVYaml}>
            Edit CSV in YAML
          </button>
          <button className="oh-button oh-button-secondary" onClick={this.showPreviewOperator}>
            Preview
          </button>
        </div>
        <button className={clearClasses} disabled={isDefault} onClick={this.clearContents}>
          Clear Content
        </button>
      </div>
    );
  }

  renderManifests() {
    const { operator, storeEditorOperator } = this.props;
    const { uploadExpanded } = this.state;

    return (
      <React.Fragment>
        <div className="oh-operator-editor-page__section">
          <div className="oh-operator-editor-page__section__header">
            <div className="oh-operator-editor-page__section__header__text">
              <h2>Upload your Kubernetes manifests</h2>
              <p>
                Upload your existing YAML manifests of your Operators deployment. We support <code>Deployments</code>,
                <code>(Cluster)Roles</code>, <code>(Cluster)RoleBindings</code>, <code>ServiceAccounts</code> and{' '}
                <code>CustomResourceDefinition</code> objects. The information from these objects will be used to
                populate your Operator metadata. Alternatively, you can also upload an existing CSV.
                <br />
                <br />
                <b>Note:</b> For a complete bundle the CRDs manifests are required.
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
          {uploadExpanded && <ManifestUploader operator={operator} onUpdate={storeEditorOperator} />}
        </div>
      </React.Fragment>
    );
  }

  renderGeneralInfo() {
    const { operator, history } = this.props;

    const fields = [
      'spec.displayName',
      'metadata.annotations.description',
      'spec.description',
      'spec.maturity',
      'spec.version',
      'spec.replaces',
      'spec.minKubeVersion',
      'metadata.annotations.capabilities',
      'spec.installModes',
      'spec.labels',
      'spec.selector.matchLabels',
      'metadata.annotations.categories',
      'spec.keywords',
      'spec.icon'
    ];

    return (
      <React.Fragment>
        <h2>General Info</h2>
        <EditorSection
          operator={operator}
          fields={fields}
          title="Operator Metadata"
          description="The metadata section contains general metadata around the name, version, and other info that aids users in discovery of your Operator."
          history={history}
          sectionLocation="metadata"
        />
      </React.Fragment>
    );
  }

  renderCustomResourceDefinitions() {
    const { operator, history } = this.props;

    return (
      <React.Fragment>
        <h2>Custom Resource Definitions</h2>
        <EditorSection
          operator={operator}
          title="Owned CRDs"
          description={_.get(operatorObjectDescriptions, 'spec.customresourcedefinitions.owned.description')}
          history={history}
          sectionLocation="owned-crds"
        />
        <EditorSection
          operator={operator}
          title="Required CRDs (Optional)"
          description={_.get(operatorObjectDescriptions, 'spec.customresourcedefinitions.required.description')}
          history={history}
          sectionLocation="required-crds"
        />
      </React.Fragment>
    );
  }

  renderOperatorInstallation() {
    const { operator, history } = this.props;

    return (
      <React.Fragment>
        <h2>Installation and Permissions</h2>
        <EditorSection
          operator={operator}
          title="Deployments"
          description={_.get(operatorFieldDescriptions, 'spec.install.spec.deployments')}
          history={history}
          sectionLocation="deployments"
        />
        <EditorSection
          operator={operator}
          title="Permissions"
          description={_.get(operatorObjectDescriptions, 'spec.install.spec.permissions.description')}
          history={history}
          sectionLocation="permissions"
        />
        <EditorSection
          operator={operator}
          title="Cluster Permissions"
          description={_.get(operatorObjectDescriptions, 'spec.install.spec.clusterPermissions.description')}
          history={history}
          sectionLocation="cluster-permissions"
        />
        <EditorSection
          operator={operator}
          title="Install Modes"
          description={operatorFieldDescriptions.spec.installModes}
          history={history}
          sectionLocation="install-modes"
        />
      </React.Fragment>
    );
  }

  renderPackageInfo() {
    const { operator, history } = this.props;

    return (
      <React.Fragment>
        <h2>Package</h2>
        <EditorSection
          operator={operator}
          title="Package definition"
          description="The package sections contains informations about unique package name and channel where is operator distributed."
          history={history}
          sectionLocation="package"
        />
      </React.Fragment>
    );
  }

  render() {
    const { operator, history } = this.props;
    const { previewShown } = this.state;

    return (
      <OperatorEditorSubPage
        title="Package your Operator"
        header={this.renderHeader()}
        buttonBar={this.renderButtonBar()}
        history={history}
      >
        {this.renderManifests()}
        {this.renderGeneralInfo()}
        {this.renderCustomResourceDefinitions()}
        {this.renderOperatorInstallation()}
        {this.renderPackageInfo()}
        <PreviewOperatorModal show={previewShown} yamlOperator={operator} onClose={this.hidePreviewOperator} />
        <a className="oh-operator-editor-page__download-link" ref={this.setGenerateAction} />
      </OperatorEditorSubPage>
    );
  }
}

OperatorBundlePage.propTypes = {
  operator: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  sectionStatus: PropTypes.object,
  resetEditorOperator: PropTypes.func,
  showConfirmModal: PropTypes.func,
  hideConfirmModal: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorBundlePage.defaultProps = {
  operator: {},
  storeEditorOperator: helpers.noop,
  sectionStatus: {},
  resetEditorOperator: helpers.noop,
  showConfirmModal: helpers.noop,
  hideConfirmModal: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  storeEditorOperator: operator =>
    dispatch({
      type: reduxConstants.SET_EDITOR_OPERATOR,
      operator
    }),
  resetEditorOperator: () =>
    dispatch({
      type: reduxConstants.RESET_EDITOR_OPERATOR
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
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorBundlePage);
