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
import ManifestUploader from '../../components/editor/ManifestUploader';
import { operatorFieldDescriptions, operatorObjectDescriptions } from '../../utils/operatorDescriptors';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import PreviewOperatorModal from '../../components/modals/PreviewOperatorModal';
import { EDITOR_STATUS, operatorNameFromOperator, yamlFromOperator } from './editorPageUtils';
import { defaultOperator, validateOperator } from '../../utils/operatorUtils';

class OperatorFormEditorPage extends React.Component {
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
    this.props.history.push('/editor/yaml');
  };

  generateCSV = () => {
    const { operator } = this.props;

    let operatorYaml;
    try {
      operatorYaml = yamlFromOperator(operator);
    } catch (e) {
      operatorYaml = '';
    }

    const name = operatorNameFromOperator(operator);

    const zip = new JSZip();
    zip.file(`${name}/${name}.clusterserviceversion.yaml`, operatorYaml);

    zip.generateAsync({ type: 'base64' }).then(
      base64 => {
        this.generateAction.href = `data:application/zip;base64,${base64}`;
        this.generateAction.download = `${_.get(operator, 'spec.displayName')}.bundle.zip`;
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

  renderMetadataSection() {
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
    return (
      <EditorSection
        operator={operator}
        title="Owned CRDs"
        description={_.get(operatorObjectDescriptions, 'spec.customresourcedefinitions.owned.description')}
        history={history}
        sectionLocation="owned-crds"
      />
    );
  };

  renderRequiredCRDs = () => {
    const { operator, history } = this.props;
    return (
      <EditorSection
        operator={operator}
        title="Required CRDs (Optional)"
        description={_.get(operatorObjectDescriptions, 'spec.customresourcedefinitions.required.description')}
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
    return (
      <EditorSection
        operator={operator}
        title="Deployments"
        description={_.get(operatorFieldDescriptions, 'spec.install.spec.deployments')}
        history={history}
        sectionLocation="deployments"
      />
    );
  };

  renderPermissions = () => {
    const { operator, history } = this.props;
    return (
      <EditorSection
        operator={operator}
        title="Permissions"
        description={_.get(operatorObjectDescriptions, 'spec.install.spec.permissions.description')}
        history={history}
        sectionLocation="permissions"
      />
    );
  };

  renderClusterPermissions = () => {
    const { operator, history } = this.props;
    return (
      <EditorSection
        operator={operator}
        title="Cluster Permissions"
        description={_.get(operatorObjectDescriptions, 'spec.install.spec.clusterPermissions.description')}
        history={history}
        sectionLocation="cluster-permissions"
      />
    );
  };

  renderInstallModes = () => {
    const { operator, history } = this.props;
    return (
      <EditorSection
        operator={operator}
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
        {this.renderClusterPermissions()}
        {this.renderInstallModes()}
      </React.Fragment>
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
          {uploadExpanded && <ManifestUploader operator={operator} onUpdate={storeEditorOperator} />}
        </div>
      </React.Fragment>
    );
  }

  renderHeader = () => (
    <React.Fragment>
      <div className="oh-operator-editor-page__header">
        <h1>Create your Operator Bundle</h1>
      </div>
      <p>
        This editor is aimed to assist in creating and editing a Cluster Service Version (CSV) for your operator. Start
        by uploading your operator manifests for deployments, RBAC, CRDs, or an existing ClusterServiceVersion file. The
        forms below will be populated with all valid information and used to create the CSV file for your operator.
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
        <PreviewOperatorModal show={previewShown} yamlOperator={operator} onClose={this.hidePreviewOperator} />
        <a className="oh-operator-editor-page__download-link" ref={this.setGenerateAction} />
      </OperatorEditorSubPage>
    );
  }
}

OperatorFormEditorPage.propTypes = {
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

OperatorFormEditorPage.defaultProps = {
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
)(OperatorFormEditorPage);
