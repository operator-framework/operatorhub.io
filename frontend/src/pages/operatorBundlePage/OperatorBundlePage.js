import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux/index';
import EditorSection from '../../components/editor/EditorSection';
import ManifestUploader from '../../components/editor/manfiestUploader/ManifestUploader';
import { operatorFieldDescriptions, operatorObjectDescriptions } from '../../utils/operatorDescriptors';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import PreviewOperatorModal from '../../components/modals/PreviewOperatorModal';
import OperatorBundleDownloader from '../../components/editor/BundleDownloader';
import { resetEditorOperatorAction } from '../../redux/actions/editorActions';

class OperatorBundlePage extends React.Component {
  state = {
    previewShown: false
  };

  onEditCSVYaml = e => {
    e.preventDefault();
    this.props.history.push('/bundle/yaml');
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
    hideConfirmModal();
  };

  clearContents = () => {
    const { showClearConfirmModal } = this.props;
    showClearConfirmModal(this.doClearContents);
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

  renderButtonBar() {
    return (
      <div className="oh-operator-editor-page__button-bar">
        <div>
          <OperatorBundleDownloader />
          <button className="oh-button oh-button-secondary" onClick={this.onEditCSVYaml}>
            Edit CSV in YAML
          </button>
          <button className="oh-button oh-button-secondary" onClick={this.showPreviewOperator}>
            Preview
          </button>
        </div>
        <button className="oh-button oh-button-secondary" onClick={this.clearContents}>
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
        pageId="oh-editor-landing-page"
        title="Package your Operator"
        header={this.renderHeader()}
        buttonBar={this.renderButtonBar()}
        history={history}
      >
        <ManifestUploader />
        <div className="oh-operator-editor-page__spacer">
          <h2>General Info</h2>
          <button className="oh-button oh-button-secondary oh-button__new-operator" onClick={this.clearContents}>
            Clear All and Start New Bundle
          </button>
        </div>
        <EditorSection
          title="Operator Metadata"
          description="The metadata section contains general metadata around the name, version, and other info that aids users in discovery of your Operator."
          history={history}
          sectionLocation="metadata"
        />
        {this.renderCustomResourceDefinitions()}
        {this.renderOperatorInstallation()}
        {this.renderPackageInfo()}
        <PreviewOperatorModal show={previewShown} yamlOperator={operator} onClose={this.hidePreviewOperator} />
      </OperatorEditorSubPage>
    );
  }
}

OperatorBundlePage.propTypes = {
  operator: PropTypes.object,
  resetEditorOperator: PropTypes.func,
  showClearConfirmModal: PropTypes.func,
  hideConfirmModal: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorBundlePage.defaultProps = {
  operator: {},
  resetEditorOperator: helpers.noop,
  showClearConfirmModal: helpers.noop,
  hideConfirmModal: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  resetEditorOperator: () => dispatch(resetEditorOperatorAction()),
  showClearConfirmModal: onConfirm =>
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
  operator: state.editorState.operator
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorBundlePage);
