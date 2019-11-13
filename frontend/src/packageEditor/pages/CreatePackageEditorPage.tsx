import React from 'react';
import { connect } from 'react-redux';
import { History } from 'history';

import OperatorEditorSubPage from '../../pages/operatorBundlePage/subPage/OperatorEditorSubPage';

import { CreatePackagePageButtonBar, CreatePackagePageHeader, CreateNewPackageSection } from '../../components/packageEditor/createPackage';
import { bindActionCreators } from 'redux';
import { resetEditorOperatorAction } from '../../redux/actions';
import OperatorPackageUploader  from '../../components/uploader/package/PackageUploader';

export interface OperatorPackagePageProps {
    history: History
}

const OperatorPackagePageActions = {
    resetEditorOperator: resetEditorOperatorAction
}

interface OperatorPackageEditorPageState {
    activeTab: number
    pageIsValid: boolean
    packageName: string
    defaultChannelName: string
}

class OperatorPackageEditorPage extends React.PureComponent<OperatorPackagePageProps, OperatorPackageEditorPageState>{

    props: OperatorPackagePageProps & typeof OperatorPackagePageActions;

    state: OperatorPackageEditorPageState = {
        activeTab: 2,
        pageIsValid: false,
        packageName: '',
        defaultChannelName: ''
    }

    title = 'Create your Operator Package';

    desc = `This page wil assist you in the creation or modification of your Operator Package. Start by uploading your Kubernetes manifest files.
        The forms below will be populated with all valid information and used to create Operator Package. You can modify or add properties through
        these forms as well.`


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


    render() {
        const { history } = this.props;
        const { activeTab, pageIsValid } = this.state;

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
                        activeTab={1}
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
                            <div className="oh-operator-editor-form__field-section">
                                <OperatorPackageUploader  createFromScratch={() => this.onNavSelect(1)} />
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