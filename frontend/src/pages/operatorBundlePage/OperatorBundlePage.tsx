import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { Icon } from 'patternfly-react';
import { bindActionCreators } from 'redux';

import { noop } from '../../common/helpers';
import EditorSection from '../../components/editor/EditorSection';
import OperatorVersionUploader from '../../components/uploader/operator/OperatorVersionUploader';
import { operatorFieldDescriptions, operatorObjectDescriptions } from '../../utils/operatorDescriptors';
import OperatorEditorSubPage from './subPage/OperatorEditorSubPage';
import PreviewOperatorModal from '../../components/modals/PreviewOperatorModal';
import OperatorBundleDownloader from '../../components/editor/BundleDownloader';
import { resetEditorOperatorAction, setBatchSectionsStatusAction } from '../../redux/actions/editorActions';
import { removeEmptyOptionalValuesFromOperator } from '../../utils/operatorValidation';
import { getUpdatedFormErrors, getVersionEditorRootPath } from './bundlePageUtils';
import { sectionsFields, EDITOR_STATUS, VersionEditorParamsMatch } from '../../utils/constants';
import { ExternalLink } from '../../components/ExternalLink';
import { fileAnIssue } from '../../utils/documentationLinks';
import { hideConfirmModalAction, showClearConfirmationModalAction, StoreState } from '../../redux';
import { History } from 'history';

const OperatorBundlePageActions = {
  resetEditorOperator: resetEditorOperatorAction,
  showClearConfirmModal: showClearConfirmationModalAction,
  hideConfirmModal: hideConfirmModalAction,
  setBatchSectionsStatus: setBatchSectionsStatusAction
};

export type OperatorBundlePageProps = {
  history: History,
  match: VersionEditorParamsMatch

} & ReturnType<typeof mapStateToProps> & typeof OperatorBundlePageActions;

interface OperatorBundlePageState {
  previewShown: boolean
}

class OperatorBundlePage extends React.PureComponent<OperatorBundlePageProps, OperatorBundlePageState> {

  static propTypes;
  static defaultProps;

  state = {
    previewShown: false
  };

  componentDidMount() {
    const { operator, setBatchSectionsStatus, sectionStatus } = this.props;

     

    const updatedSectionsStatus = {} as any;
    // remove invalid defaults before validation so they do not cause false errors
    const cleanedOperator = removeEmptyOptionalValuesFromOperator(operator);

    // iterate over sections to update its state so user see where errors happened
    Object.keys(sectionsFields).forEach(sectionName => {
      const status = sectionStatus[sectionName];

      // skip validation for sections which are not started yet
      if (status === EDITOR_STATUS.empty) {
        return;
      }

      const fields = sectionsFields[sectionName];
      const sectionErrors = getUpdatedFormErrors(cleanedOperator, {}, fields);

      // check if some section field has error
      const sectionHasErrors = _.castArray(fields).some(field => _.get(sectionErrors, field));

      if (sectionHasErrors) {
        updatedSectionsStatus[sectionName] = EDITOR_STATUS.errors;
      } else if (status === EDITOR_STATUS.errors) {
        updatedSectionsStatus[sectionName] = EDITOR_STATUS.pending;
      }
    });

    if (Object.keys(updatedSectionsStatus).length > 0) {
      setBatchSectionsStatus(updatedSectionsStatus);
    }
  }

  onBackToChannelEditor =  (e: React.MouseEvent) => {
    const { history, match } = this.props;

    const pathname = history.location.pathname;
    // remove slash before channel name
    const channelPath = pathname.substring(0, pathname.indexOf(match.params.channelName) -1);

    e.preventDefault();
    history.push(channelPath);
  };

  onEditCSVYaml = (e: React.MouseEvent) => {
    const { history, match } = this.props;

    e.preventDefault();
    history.push(`${getVersionEditorRootPath(match)}/yaml`);
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
      <blockquote>
        Thanks for trying out the Operator Bundle Editor beta. Feedback and questions are encouraged:{' '}
        <ExternalLink href={fileAnIssue}>File an issue on Github</ExternalLink>
      </blockquote>
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



  renderButtonBar() {
    return (
      <div className="oh-operator-editor-page__button-bar">
        <div>
        <button className="oh-button oh-button-primary" onClick={this.onBackToChannelEditor}>
            Back to Package Definition
          </button>
          <button className="oh-button oh-button-secondary" onClick={this.onEditCSVYaml}>
            Edit CSV in YAML
          </button>
          <button className="oh-button oh-button-secondary" onClick={this.showPreviewOperator}>
            Preview
          </button>
        </div>       
      </div>
    );
  }

  render() {
    const { operator, history, match } = this.props;
    const { previewShown } = this.state;

    return (
      <OperatorEditorSubPage
        pageId="oh-editor-landing-page"
        versionEditorRootPath={getVersionEditorRootPath(match)}
        header={this.renderHeader()}
        buttonBar={this.renderButtonBar()}
        history={history}
        validatePage={() => true}
      >
        <OperatorVersionUploader />
        <div className="oh-operator-editor-page__spacer">
          <h2>General Info</h2>
          <a href="#" className="oh-operator-editor-page__new-operator" onClick={this.clearContents}>
            <Icon type="fa" name="trash" />
            <span>Clear All and Start New Bundle</span>
          </a>
        </div>
        <EditorSection
          title="Operator Metadata"
          description="The metadata section contains general metadata around the name, version, and other info that aids users in discovery of your Operator."
          history={history}
          sectionLocation="metadata"
        />
        {this.renderCustomResourceDefinitions()}
        {this.renderOperatorInstallation()}
        {previewShown && (
          <PreviewOperatorModal
            show={previewShown}
            yamlOperator={operator}
            onClose={this.hidePreviewOperator}
            operatorPackage={{
              name: match.params.packageName,
              channel: match.params.channelName
            }}
          />
        )}
      </OperatorEditorSubPage>
    );
  }
}

OperatorBundlePage.propTypes = {
  operator: PropTypes.object,
  sectionStatus: PropTypes.object,
  resetEditorOperator: PropTypes.func,
  showClearConfirmModal: PropTypes.func,
  hideConfirmModal: PropTypes.func,
  setBatchSectionsStatus: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorBundlePage.defaultProps = {
  operator: {},
  sectionStatus: {},
  resetEditorOperator: noop,
  showClearConfirmModal: noop,
  hideConfirmModal: noop,
  setBatchSectionsStatus: noop
};

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(OperatorBundlePageActions, dispatch)
});

const mapStateToProps = (state: StoreState) => ({
  operator: state.editorState.operator,
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorBundlePage);
