import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import { Icon } from 'patternfly-react';
import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import EditorSection from '../../components/editor/EditorSection';
import ManifestUploader from '../../components/editor/ManifestUploader';
import { operatorFieldDescriptions, operatorObjectDescriptions } from '../../utils/operatorDescriptors';
import OperatorEditorPage from './OperatorEditorPage';

class OperatorFormEditorPage extends React.Component {
  state = {
    uploadExpanded: false
  };

  toggleUploadExpanded = event => {
    event.preventDefault();
    this.setState({ uploadExpanded: !this.state.uploadExpanded });
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
        <h1>Build the Cluster Service Version (CSV) for your Operator</h1>
      </div>
      <p>
        This editor is aimed to assist in creating and editing a Cluster Service Version (CSV) for your operator. Start
        by uploading your operator manifests for deployments, RBAC, CRDs, or an existing ClusterServiceVersion file. The
        forms below will be populated with all valid information and used to create the CSV file for your operator.
      </p>
    </React.Fragment>
  );

  render() {
    const { history } = this.props;

    return (
      <OperatorEditorPage title="Operator Editor" header={this.renderHeader()} history={history}>
        {this.renderManifests()}
        {this.renderGeneralInfo()}
        {this.renderCustomResourceDefinitions()}
        {this.renderOperatorInstallation()}
      </OperatorEditorPage>
    );
  }
}

OperatorFormEditorPage.propTypes = {
  operator: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorFormEditorPage.defaultProps = {
  operator: {},
  storeEditorOperator: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  storeEditorOperator: operator =>
    dispatch({
      type: reduxConstants.SET_EDITOR_OPERATOR,
      operator
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorFormEditorPage);
