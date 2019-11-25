import React from 'react';
import { connect } from 'react-redux';
import { History } from 'history';
import { bindActionCreators } from 'redux';
import { Alert } from 'patternfly-react';

import OperatorEditorSubPage from '../operatorBundlePage/subPage/OperatorEditorSubPage';
import { advancedUploadAvailable, supportFileSystemEntry } from '../../common/helpers';
import { CreatePackagePageButtonBar, CreatePackagePageHeader, CreateNewPackageSection } from '../../components/packageEditor/createPackage';
import { resetEditorOperatorAction, showGithubPackageUploadAction, clearPackageUploadsAction, showClearConfirmationModalAction, hideConfirmModalAction } from '../../redux/actions';
import OperatorPackageUploader from '../../components/uploader/package/PackageUploader';


const OperatorPackagePageActions = {
    showGithubPackageUpload: showGithubPackageUploadAction,
    resetEditorOperator: resetEditorOperatorAction,
    clearPackageUploads: clearPackageUploadsAction,
    showClearConfirmationModal: showClearConfirmationModalAction,
    hideConfirmationModal: hideConfirmModalAction
}

export type OperatorPackagePageProps = {
    history: History
} & typeof OperatorPackagePageActions;


interface OperatorPackageEditorPageState {
    activeTab: number
    pageIsValid: boolean
    supportFileSystemEntry: boolean

}

enum OperatorPackageEditorPageTabs {
    createPackage = 1,
    editPackage = 2
}


class OperatorPackageEditorPage extends React.PureComponent<OperatorPackagePageProps, OperatorPackageEditorPageState>{


    state: OperatorPackageEditorPageState = {
        activeTab: OperatorPackageEditorPageTabs.editPackage,
        pageIsValid: false,
        supportFileSystemEntry: false
    }

    title = 'Create your Operator Package';

    desc = `This page wil assist you in the creation or modification of your Operator Package. Start by uploading your Kubernetes manifest files.
        The forms below will be populated with all valid information and used to create Operator Package. You can modify or add properties through
        these forms as well.`;

    newPackageComponent: CreateNewPackageSection | null;

    componentDidMount() {
        // we need extra support for traversing directory structure in uploaded folder
        this.setState({ supportFileSystemEntry: advancedUploadAvailable() && supportFileSystemEntry() });
    }

    onPackageCreate = (e: React.MouseEvent) => {
        const { history, resetEditorOperator } = this.props;
        const { activeTab } = this.state;
        e.preventDefault();

        switch (activeTab) {
            case OperatorPackageEditorPageTabs.createPackage: {

                if (this.newPackageComponent) {
                    const { packageName, defaultChannel } = this.newPackageComponent.state;

                    resetEditorOperator();
                    history.push(`/bundle/${packageName}/${defaultChannel}`)
                }
                break;
            }
            case OperatorPackageEditorPageTabs.editPackage: {
                // TODO: Navigate to channel editor page
                break;
            }
        }
    }

    onPackageClear = (e: React.MouseEvent) => {
        const { clearPackageUploads, showClearConfirmationModal, hideConfirmationModal } = this.props;
        const { activeTab } = this.state;
        e.preventDefault();

        switch (activeTab) {
            case OperatorPackageEditorPageTabs.createPackage: {
                this.newPackageComponent && this.newPackageComponent.clearForm();
                break;
            }
            case OperatorPackageEditorPageTabs.editPackage: {
                showClearConfirmationModal(() => {
                    clearPackageUploads();
                    hideConfirmationModal();
                });
                break;
            }
        }
    }

    onNavSelect = (activeTab: number) => {
        this.setState({ activeTab, pageIsValid: false });
    }

    onSectionChanged = (sectionIsValid: boolean) => {
        this.setState({ pageIsValid: sectionIsValid });
    };

    onCreateFromScratch = (e: React.MouseEvent) => {
        e.preventDefault();

        this.onNavSelect(OperatorPackageEditorPageTabs.createPackage);
    }


    render() {
        const { history, showGithubPackageUpload } = this.props;
        const { activeTab, pageIsValid, supportFileSystemEntry } = this.state;

        return (
            <OperatorEditorSubPage
                pageId="oh-operator-package-editor-page"
                title="Create your Operator Package"
                field=""
                history={history}
                description=""
                pageErrors={false}
                buttonBar={
                    <CreatePackagePageButtonBar
                        valid={pageIsValid}
                        onCreate={this.onPackageCreate}
                        onClear={this.onPackageClear}
                    />
                }
                header={
                    <CreatePackagePageHeader
                        title={this.title}
                        desc={this.desc}
                        activeTab={activeTab}
                        onNavSelect={this.onNavSelect}
                    />
                }
                validatePage={() => true}
            >
                <div className="oh-operator-package-editor-page__tab-pane">
                    {activeTab === OperatorPackageEditorPageTabs.createPackage &&
                        <div className="oh-operator-package-editor-page__tab-content">
                            <CreateNewPackageSection
                                ref={ref => this.newPackageComponent = ref}
                                onSectionValidatedCallback={this.onSectionChanged}
                            />
                        </div>
                    }
                    {activeTab === OperatorPackageEditorPageTabs.editPackage &&
                        <div className="oh-operator-package-editor-page__tab-content">
                            {
                                !supportFileSystemEntry && (
                                    <Alert type="warning">
                                        <p>The Folder Uploader is not compatible with the browser you are using. Use Google Chrome, Mozila Firefox or Microsoft Edge
                                            instead for uploading your entire package folder. Your can upload package folder from &nbsp;
                                            <a href="#" className="oh-drag-drop-box__upload-file-box__link" onClick={showGithubPackageUpload}>Github community operators repository.</a>
                                            Alternatively, you can <a href="#" onClick={this.onCreateFromScratch}>create your Operator Package from Scratch.</a>
                                        </p>
                                    </Alert>
                                )
                            }
                            <div className={`oh-operator-editor-form__field-section ${!supportFileSystemEntry ? 'oh-folder-upload-disabled' : ''}`}>
                                <OperatorPackageUploader
                                    onUploadChangeCallback={this.onSectionChanged}
                                />
                            </div>
                        </div>
                    }
                </div>
            </OperatorEditorSubPage>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    ...bindActionCreators(OperatorPackagePageActions, dispatch)
});


export default connect(null, mapDispatchToProps)(OperatorPackageEditorPage);