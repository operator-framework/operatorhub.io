import React from 'react';
import { connect } from 'react-redux';
import { History } from 'history';
import { bindActionCreators } from 'redux';
import { Alert } from 'patternfly-react';

import { advancedUploadAvailable, supportFileSystemEntry } from '../../common/helpers';
import { CreatePackagePageButtonBar, CreatePackagePageHeader, CreateNewPackageSection } from '../../components/packageEditor/createPackage';
import * as actions from '../../redux/actions';
import OperatorPackageUploader, { OperatorPackageUploaderComponent } from '../../components/uploader/package/PackageUploader';
import PackageEditorPageWrapper from './pageWrapper/PackageEditorPageWrapper';
import { StoreState } from '../../redux';
import { getDefaultOperatorWithName } from '../../utils/operatorUtils';


const OperatorPackagePageActions = {
    showGithubPackageUpload: actions.showGithubPackageUploadAction,
    resetEditorOperator: actions.resetEditorOperatorAction,
    clearPackageUploads: actions.clearPackageUploadsAction,
    showClearConfirmationModal: actions.showClearConfirmationModalAction,
    hideConfirmationModal: actions.hideConfirmModalAction,
    setPackageName: actions.setPackageNameAction,
    setPackageChannels: actions.setPackageChannelsAction,
    setPackageOperatorVersions: actions.setPackageOperatorVersionsAction,
    storeEditorOperator: actions.storeEditorOperatorAction
}

export type PackageEditorLandingPageProps = {
    history: History
} & typeof OperatorPackagePageActions & ReturnType<typeof mapStateToProps>;


interface PackageEditorLandingPageState {
    activeTab: number
    pageIsValid: boolean
    supportFileSystemEntry: boolean

}

enum PackageEditorLandingPageTabs {
    createPackage = 1,
    editPackage = 2
}


class PackageEditorLandingPage extends React.PureComponent<PackageEditorLandingPageProps, PackageEditorLandingPageState>{


    state: PackageEditorLandingPageState = {
        activeTab: PackageEditorLandingPageTabs.createPackage,
        pageIsValid: false,
        supportFileSystemEntry: false
    }

    title = 'Create your Operator Package';

    desc = `This page wil assist you in the creation or modification of your Operator Package. Start by uploading your Kubernetes manifest files.
        The forms below will be populated with all valid information and used to create Operator Package. You can modify or add properties through
        these forms as well.`;

    newPackageComponent: CreateNewPackageSection | null;

    packageUploaderComponent: OperatorPackageUploaderComponent | null;

    componentDidMount() {
        // we need extra support for traversing directory structure in uploaded folder
        this.setState({ supportFileSystemEntry: advancedUploadAvailable() && supportFileSystemEntry() });
    }

    onPackageCreate = (e: React.MouseEvent) => {
        const { history, packageName, } = this.props;
        const { activeTab } = this.state;
        e.preventDefault();

        switch (activeTab) {
            case PackageEditorLandingPageTabs.createPackage: {

                if (this.newPackageComponent) {
                    const { packageName, operatorVersion, defaultChannel } = this.newPackageComponent.state;

                    this.createPackage(packageName, operatorVersion, defaultChannel);
                    history.push(`/packages/${encodeURIComponent(packageName)}/${encodeURIComponent(defaultChannel)}/${encodeURIComponent(operatorVersion)}`);
                }
                break;
            }
            case PackageEditorLandingPageTabs.editPackage: {
                if (this.packageUploaderComponent) {
                    this.packageUploaderComponent.convertUploadsToChannelsAndVersions();
                }
                history.push(`/packages/${encodeURIComponent(packageName)}`);
                break;
            }
        }
    }

    createPackage = (packageName: string, operatorVersion: string, defaultChannelName: string) => {
        const { resetEditorOperator, setPackageChannels, setPackageName, setPackageOperatorVersions, storeEditorOperator } = this.props;

        const versionFullName = `${packageName}.v${operatorVersion}`;
        const versionCsv = getDefaultOperatorWithName(packageName, operatorVersion);

        setPackageName(packageName);
        setPackageChannels([{
            name: defaultChannelName,
            isDefault: true,
            currentVersion: operatorVersion,
            currentVersionFullName: versionFullName,
            versions: [operatorVersion]
        }]);
        setPackageOperatorVersions([{
            name: versionFullName,
            version: operatorVersion,
            csv: versionCsv,
            valid: true,
            crdUploads: []
        }]);

        // clear version editor state and set current operator
        resetEditorOperator();
        storeEditorOperator(versionCsv);
    }

    onPackageClear = (e: React.MouseEvent) => {
        const { clearPackageUploads, showClearConfirmationModal, hideConfirmationModal } = this.props;
        const { activeTab } = this.state;
        e.preventDefault();

        switch (activeTab) {
            case PackageEditorLandingPageTabs.createPackage: {
                this.newPackageComponent && this.newPackageComponent.clearForm();
                break;
            }
            case PackageEditorLandingPageTabs.editPackage: {
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

        this.onNavSelect(PackageEditorLandingPageTabs.createPackage);
    }


    render() {
        const { history, showGithubPackageUpload } = this.props;
        const { activeTab, pageIsValid, supportFileSystemEntry } = this.state;

        return (
            <PackageEditorPageWrapper
                pageId="oh-operator-package-editor-page"
                history={history}
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
                breadcrumbs={[]}
            >
                <div className="oh-operator-package-editor-page__tab-pane">
                    {activeTab === PackageEditorLandingPageTabs.createPackage &&
                        <div className="oh-operator-package-editor-page__tab-content">
                            <CreateNewPackageSection
                                ref={ref => this.newPackageComponent = ref}
                                onSectionValidatedCallback={this.onSectionChanged}
                            />
                        </div>
                    }
                    {activeTab === PackageEditorLandingPageTabs.editPackage &&
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
                                    ref={(ref: OperatorPackageUploaderComponent) => this.packageUploaderComponent = ref}
                                    onUploadChangeCallback={this.onSectionChanged}
                                />
                            </div>
                        </div>
                    }
                </div>
            </PackageEditorPageWrapper>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    ...bindActionCreators(OperatorPackagePageActions, dispatch)
});

const mapStateToProps = (state: StoreState) => ({
    packageName: state.packageEditorState.packageName
})


export default connect(mapStateToProps, mapDispatchToProps)(PackageEditorLandingPage);