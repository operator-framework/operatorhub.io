import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import JSZip from 'jszip';
import { safeDump } from 'js-yaml';
import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux/index';
import EditorSection from '../../components/editor/EditorSection';
import ManifestUploader from '../../components/editor/manfiestUploader/ManifestUploader';
import { operatorFieldDescriptions, operatorObjectDescriptions } from '../../utils/operatorDescriptors';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import PreviewOperatorModal from '../../components/modals/PreviewOperatorModal';
import {
  EDITOR_STATUS,
  operatorNameFromOperator,
  yamlFromOperator,
  getMissingCrdUploads,
  filterValidCrdUploads
} from './bundlePageUtils';
import { defaultOperator, validateOperator, removeEmptyOptionalValuesFromOperator } from '../../utils/operatorUtils';

class OperatorBundlePage extends React.Component {
  state = {
    validCSV: false,
    sectionsValid: false,
    previewShown: false
  };

  componentDidMount() {
    const { operator, sectionStatus } = this.props;
    const sectionsValid = _.every(_.keys(sectionStatus), key => sectionStatus[key] === EDITOR_STATUS.complete);

    this.setState({
      validCSV: validateOperator(operator),
      sectionsValid
    });
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

  onEditCSVYaml = e => {
    e.preventDefault();
    this.props.history.push('/bundle/yaml');
  };

  createPackageFile = (operatorPackage, name) => {
    let packageYaml = '';

    try {
      packageYaml = safeDump({
        packageName: operatorPackage.name,
        channels: [
          {
            name: operatorPackage.channel,
            currentCSV: name
          }
        ]
      });
    } catch (e) {
      console.error("Can't create package file.");
    }
    return packageYaml;
  };

  scrollToUploader = () => {
    const uploader = document.getElementById('oh-operator--editor-page__manifest-uploader');

    // scroll to uploader if it exists
    if (uploader) {
      uploader.scrollIntoView();
    } else {
      // fallback to top in case something change
      window.scroll({ top: 0 });
    }
  };

  generateCSV = () => {
    const { operator, uploads, operatorPackage } = this.props;

    const hasMissingCrdUploads = getMissingCrdUploads(uploads, operator).length > 0;

    // do not allow dowloading bundle with missing CRDs
    if (hasMissingCrdUploads) {
      this.scrollToUploader();
      return;
    }

    // remove values which are part of default operator, but are invalid
    const cleanedOperator = removeEmptyOptionalValuesFromOperator(operator);

    let operatorYaml;
    try {
      operatorYaml = yamlFromOperator(cleanedOperator);
    } catch (e) {
      operatorYaml = '';
    }
    const name = operatorNameFromOperator(cleanedOperator);
    const shortName = _.get(operator, 'metadata.name');

    const uploadedCrds = filterValidCrdUploads(uploads);
    const packageYaml = this.createPackageFile(operatorPackage, name);

    const zip = new JSZip();
    zip.file(`${name}/${shortName}.package.yaml`, packageYaml);
    zip.file(`${name}/${name}.clusterserviceversion.yaml`, operatorYaml);

    uploadedCrds.forEach(crd => {
      let crdYaml = '';
      let crdName = '';

      try {
        crdYaml = safeDump(crd.data);
        crdName = crd.data.metadata.name;
      } catch (e) {
        console.warn(`Can't convert crd to yaml for ${crdName}`);
      }

      zip.file(`${name}/${crdName}.crd.yaml`, crdYaml);
    });

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

  renderGeneralInfo() {
    const { history } = this.props;

    return (
      <React.Fragment>
        <h2>General Info</h2>
        <EditorSection
          title="Operator Metadata"
          description="The metadata section contains general metadata around the name, version, and other info that aids users in discovery of your Operator."
          history={history}
          sectionLocation="metadata"
        />
      </React.Fragment>
    );
  }

  renderCustomResourceDefinitions() {
    const { history } = this.props;

    return (
      <React.Fragment>
        <h2>Custom Resource Definitions</h2>
        <EditorSection
          title="Owned CRDs"
          description={_.get(operatorObjectDescriptions, 'spec.customresourcedefinitions.owned.description')}
          history={history}
          sectionLocation="owned-crds"
        />
        <EditorSection
          title="Required CRDs (Optional)"
          description={_.get(operatorObjectDescriptions, 'spec.customresourcedefinitions.required.description')}
          history={history}
          sectionLocation="required-crds"
        />
      </React.Fragment>
    );
  }

  renderOperatorInstallation() {
    const { history } = this.props;

    return (
      <React.Fragment>
        <h2>Installation and Permissions</h2>
        <EditorSection
          title="Deployments"
          description={_.get(operatorFieldDescriptions, 'spec.install.spec.deployments')}
          history={history}
          sectionLocation="deployments"
        />
        <EditorSection
          title="Permissions"
          description={_.get(operatorObjectDescriptions, 'spec.install.spec.permissions.description')}
          history={history}
          sectionLocation="permissions"
        />
        <EditorSection
          title="Cluster Permissions"
          description={_.get(operatorObjectDescriptions, 'spec.install.spec.clusterPermissions.description')}
          history={history}
          sectionLocation="cluster-permissions"
        />
        <EditorSection
          title="Install Modes"
          description={operatorFieldDescriptions.spec.installModes}
          history={history}
          sectionLocation="install-modes"
        />
      </React.Fragment>
    );
  }

  renderPackageInfo() {
    const { history } = this.props;

    return (
      <React.Fragment>
        <h2>Package</h2>
        <EditorSection
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
        <ManifestUploader />
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
  sectionStatus: PropTypes.object,
  uploads: PropTypes.array,
  operatorPackage: PropTypes.object,
  resetEditorOperator: PropTypes.func,
  showConfirmModal: PropTypes.func,
  hideConfirmModal: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorBundlePage.defaultProps = {
  operator: {},
  sectionStatus: {},
  uploads: [],
  operatorPackage: {},
  resetEditorOperator: helpers.noop,
  showConfirmModal: helpers.noop,
  hideConfirmModal: helpers.noop
};

const mapDispatchToProps = dispatch => ({
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
  sectionStatus: state.editorState.sectionStatus,
  uploads: state.editorState.uploads,
  operatorPackage: state.editorState.operatorPackage
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorBundlePage);
