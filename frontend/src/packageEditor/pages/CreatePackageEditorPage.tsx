import React from 'react';
import { connect } from 'react-redux';
import { History } from 'history';
import { bindActionCreators } from 'redux';
import { Alert } from 'patternfly-react';

import OperatorEditorSubPage from '../../pages/operatorBundlePage/subPage/OperatorEditorSubPage';
import { advancedUploadAvailable, supportFileSystemEntry } from '../../common/helpers';
import { CreatePackagePageButtonBar, CreatePackagePageHeader, CreateNewPackageSection } from '../../components/packageEditor/createPackage';
import { resetEditorOperatorAction, showGithubPackageUploadAction } from '../../redux/actions';
import OperatorPackageUploader from '../../components/uploader/package/PackageUploader';


const OperatorPackagePageActions = {
    showGithubPackageUpload: showGithubPackageUploadAction,
    resetEditorOperator: resetEditorOperatorAction
}

export type OperatorPackagePageProps = {
    history: History
} & typeof OperatorPackagePageActions;


interface OperatorPackageEditorPageState {
    activeTab: number
    pageIsValid: boolean
    packageName: string
    defaultChannelName: string
    supportFileSystemEntry: boolean

}

class OperatorPackageEditorPage extends React.PureComponent<OperatorPackagePageProps, OperatorPackageEditorPageState>{


    state: OperatorPackageEditorPageState = {
        activeTab: 2,
        pageIsValid: false,
        packageName: '',
        defaultChannelName: '',
        supportFileSystemEntry: false
    }

    title = 'Create your Operator Package';

    desc = `This page wil assist you in the creation or modification of your Operator Package. Start by uploading your Kubernetes manifest files.
        The forms below will be populated with all valid information and used to create Operator Package. You can modify or add properties through
        these forms as well.`

    componentDidMount() {
        // we need extra support for traversing directory structure in uploaded folder
        this.setState({ supportFileSystemEntry: advancedUploadAvailable() && supportFileSystemEntry() });

    }

    onPackageCreate = (e: React.MouseEvent) => {
        const { history, resetEditorOperator } = this.props;
        const { pageIsValid, defaultChannelName, packageName } = this.state;
        e.preventDefault();

        if (pageIsValid) {
            resetEditorOperator();
            history.push(`/bundle/${packageName}/${defaultChannelName}`)
        }
    }

    onPackageClear = (e: React.MouseEvent) => {
        e.preventDefault();
    }

    onNavSelect = (activeTab: number) => {
        this.setState({ activeTab, pageIsValid: false });
    }

    onNewPackageValidated = (pageIsValid: boolean, packageName: string, defaultChannelName: string) => {
        this.setState({
            pageIsValid,
            packageName,
            defaultChannelName
        });
    };

    onCreateFromScratch = (e: React.MouseEvent) => {
        e.preventDefault();

        this.onNavSelect(1);
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
                    {activeTab === 1 &&
                        <div className="oh-operator-package-editor-page__tab-content">
                            <CreateNewPackageSection
                                onSectionValidatedCallback={this.onNewPackageValidated}
                            />
                        </div>
                    }
                    {activeTab === 2 &&
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
                                <OperatorPackageUploader />
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