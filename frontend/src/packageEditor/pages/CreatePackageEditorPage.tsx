import React from 'react';
import { connect } from 'react-redux';
import { History } from 'history';
import { Nav, NavItem, TabContainer } from 'patternfly-react';

import OperatorEditorSubPage from '../../pages/operatorBundlePage/subPage/OperatorEditorSubPage';

import './CreatePackageEditorPage.scss';
import OperatorInput from '../../components/editor/forms/OperatorInput';
import OperatorInputWrapper from '../../components/editor/forms/OperatorInputWrapper';
import CreateNewOperatorPackageSection from './CreateNewPackageSection';

export interface OperatorPackagePageProps {
    history: History
}

interface OperatorPackageEditorPageState {
    activeTab: number
    pageIsValid: boolean
}

class OperatorPackageEditorPage extends React.PureComponent<OperatorPackagePageProps, OperatorPackageEditorPageState>{

    state: OperatorPackageEditorPageState = {
        activeTab: 1,
        pageIsValid: true
    }

    title = 'Create your Operator Package';

    desc = `This page wil assist you in the creation or modification of your Operator Package. Start by uploading your Kubernetes manifest files.
        The forms below will be populated with all valid information and used to create Operator Package. You can modify or add properties through
        these forms as well.`


    onPackageCreate(e: React.MouseEvent) {
        e.preventDefault();
    }

    onPackageClear(e: React.MouseEvent) {
        e.preventDefault();
    }

    onNavSelect = (activeTab: number) => {
        this.setState({ activeTab, pageIsValid: false });
    }

    renderButtonBar() {
        const { pageIsValid } = this.state;

        return (
            <div className="oh-operator-package-editor-page__button-bar">
                <button className="oh-button oh-button-primary" disabled={pageIsValid} onClick={this.onPackageCreate}>
                    Create
            </button>
                <button className="oh-button oh-button-secondary" onClick={this.onPackageClear}>
                    Clear
          </button>
            </div>
        )
    }

    renderHeader() {
        return (
            <React.Fragment>
                <h1>{this.title}</h1>
                <p>
                    {this.desc}
                </p>
                <TabContainer id="oh-operator-package-editor-tabs" defaultActiveKey={1}>
                    <Nav bsClass="nav nav-tabs nav-tabs-pf" onSelect={this.onNavSelect}>
                        <NavItem eventKey={1}>Create from Scratch</NavItem>
                        <NavItem eventKey={2}>Create from Existing Operator Package</NavItem>
                    </Nav>
                </TabContainer>
            </React.Fragment>
        );
    }

    render() {
        const { history } = this.props;
        const { activeTab } = this.state;

        return (
            <OperatorEditorSubPage
                pageId="oh-operator-package-editor-page"
                title="Create your Operator Package"
                field=""
                history={history}
                description={this.desc}
                pageErrors={false}
                buttonBar={this.renderButtonBar()}
                header={this.renderHeader()}
            >
                <div className="oh-operator-package-editor-page__tab-pane">
                    {activeTab === 1 &&
                        <div className="oh-operator-package-editor-page__tab-content">
                            <CreateNewOperatorPackageSection
                                onSectionValidatedCallback={pageIsValid => {
                                    this.setState({ pageIsValid})
                                }}
                            />
                        </div>
                    }
                    {activeTab === 2 &&
                        <div className="oh-operator-package-editor-page__tab-content">
                            <div className="oh-operator-editor-form__field-section">

                            </div>
                        </div>
                    }
                </div>

            </OperatorEditorSubPage>
        );
    }
}

const mapDispatchToProps = dispatch => ({});

const mapStateToProps = state => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OperatorPackageEditorPage);