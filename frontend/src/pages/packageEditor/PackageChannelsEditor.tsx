import React from 'react';
import { connect } from 'react-redux';
import { History } from 'history';
import { bindActionCreators } from 'redux';
import { match } from 'react-router';
import { Icon } from 'patternfly-react';
import _ from 'lodash-es';
import compareVersions from 'compare-versions';

import PackageEditorPageWrapper from './pageWrapper/PackageEditorPageWrapper';
import { StoreState } from '../../redux';
import * as actions from '../../redux/actions';
import { PackageEditorChannel, PackageEditorOperatorVersionMetadata } from '../../utils/packageEditorTypes';
import ChannelEditorChannel from '../../components/packageEditor/channelsEditor/ChannelEditorChannel';
import EditChannelNameModal from '../../components/packageEditor/modals/EditChannelNameModal';

import EditVersionNameModal from '../../components/packageEditor/modals/EditVersionNameModal';
import { getDefaultOperatorWithName } from '../../utils/operatorUtils';
import {
    convertVersionCrdsToVersionUploads,
    convertVersionCsvToVersionUpload,
    createPackageBundle,
    validateChannel,
    validateOperatorVersions
} from '../../utils/packageEditorUtils';
import EditUpgradeGraphModal, { EditUpdateGraphModalMode } from '../../components/packageEditor/modals/EditUpdateGraphModal';
import { Operator } from '../../utils/operatorTypes';

const PackageChannelsEditorPageActions = {
    showRemoveChannelConfirmationModal: actions.showRemoveChannelConfirmationModalAction,
    showRemoveVersionConfirmationModal: actions.showRemoveVersionConfirmationModalAction,
    showClearConfirmationModal: actions.showClearOperatorPackageModalAction,
    showMissingDefaultChannelConfirmationModal: actions.showMissingDefaultChannelConfirmationModalAction,
    hideConfirmModal: actions.hideConfirmModalAction,
    updatePackageChannel: actions.updatePackageChannelAction,
    addPackageChannel: actions.addNewPackageChannelAction,
    makePackageChannelDefault: actions.makePackageChannelDefaultAction,
    removePackageChannel: actions.removePackageChannelAction,
    resetEditor: actions.resetPackageEditorAction,
    updatePackageEditorVersionsValidation: actions.updatePackageOperatorVersionsValidityAction,
    addOperatorVersion: actions.addPackageOperatorVersionAction,
    makePackageOperatorVersionDefault: actions.makePackageOperatorVersionDefaultAction,
    changePackageOperatorVersionName: actions.changePackageOperatorVersionNameAction,
    updatePackageOperatorVersionUpgradePath: actions.updatePackageOperatorVersionUpgradePathAction,
    removeOperatorVersion: actions.removePackageOperatorVersionAction,
    storeEditorOperator: actions.storeEditorOperatorAction,
    setVersionEditorCrdUploads: actions.setUploadsAction
};

export type PackageChannelsEditorPageProps = {
    history: History
    match: match<{packageName: string}>
} & typeof PackageChannelsEditorPageActions & ReturnType<typeof mapStateToProps>;


interface PackageChannelsEditorPageState {
    channelNameToEdit: string | null,
    addOperatorVersion: boolean,
    operatorVersionNameToEdit: string | null,
    operatorVersionToDuplicate: PackageEditorOperatorVersionMetadata | null,
    channelToAddVersion: PackageEditorChannel | null
    versionToEditUpdateGraph: PackageEditorOperatorVersionMetadata | null
}


class PackageChannelsEditorPage extends React.PureComponent<PackageChannelsEditorPageProps, PackageChannelsEditorPageState> {


    state: PackageChannelsEditorPageState = {
        channelNameToEdit: null,
        addOperatorVersion: false,
        operatorVersionNameToEdit: null,
        operatorVersionToDuplicate: null,
        channelToAddVersion: null,
        versionToEditUpdateGraph: null
    };

    title = 'Package Definition';

    desc = `The package definition contains information about channels to a particular version of ClusterServiceVersion (CSV) within
    the directory of a particular Operator Version. Channels allow you to specify different upgrade paths for different users 
    (e.g. alpha vs. stable).`;


    generateAction: HTMLAnchorElement | null = null;

    componentDidMount() {
        const { versions, updatePackageEditorVersionsValidation } = this.props;

        updatePackageEditorVersionsValidation(validateOperatorVersions(versions));
    }

    setGenerateAction = ref => {
        this.generateAction = ref;
    };

    sortChannelsByName = (sorting: 'asc' | 'desc') => (a: PackageEditorChannel, b: PackageEditorChannel) => {
        const result = a.name.localeCompare(b.name);

        return sorting === 'asc' ? result : result * -1;
    };

    addChannel = (e: React.MouseEvent) => {
        e.preventDefault();

        this.setState({ channelNameToEdit: '' });
    };

    editChannelName = (channelName: string) => this.setState({ channelNameToEdit: channelName });

    addOperatorVersion = (channel: PackageEditorChannel) => this.setState({
        addOperatorVersion: true,
        channelToAddVersion: channel
    });

    duplicateOperatorVersion = (channel: PackageEditorChannel, originalVersion: string) => {
        const { versions } = this.props;
        const version = versions.find(version => version.version === originalVersion);

        if (version) {
            this.setState({
                channelToAddVersion: channel,
                operatorVersionToDuplicate: version
            });
        } else {
            console.error(`Can't find version to update for version name ${originalVersion}`, versions);
        }
    };

    editOperatorVersionName = (channel: PackageEditorChannel, originalVersion: string) => this.setState({
        channelToAddVersion: channel,
        operatorVersionNameToEdit: originalVersion
    });

    setVersionAsDefault = (channel: PackageEditorChannel, versionName: string) => {
        const { versions, makePackageOperatorVersionDefault } = this.props;
        const targetVersion = versions.find(version => version.version === versionName);

        if (targetVersion) {
            makePackageOperatorVersionDefault(targetVersion.version, targetVersion.name, channel.name);
        } else {
            console.error(`Can't find version to update for version name ${versionName}`, versions);
        }
    };

    editUpdateGraph = (channel: PackageEditorChannel, versionName: string) => {
        const { versions } = this.props;
        const targetVersion = versions.find(version => version.version === versionName);

        if (targetVersion) {
            this.setState({
                channelToAddVersion: channel,
                versionToEditUpdateGraph: targetVersion
            });
        } else {
            console.error(`Can't find version to update for version name ${versionName}`, versions);
        }
    };


    onEditOperatorVersionNameConfirmed = (versionName: string, initialVersionName: string) => {
        const { packageName, addOperatorVersion, changePackageOperatorVersionName, versions } = this.props;
        const { channelToAddVersion } = this.state;

        // add new version
        if (initialVersionName === '') {

            if (channelToAddVersion) {
                addOperatorVersion(
                    {
                        name: `${packageName}.v${versionName}`,
                        version: versionName,
                        csv: getDefaultOperatorWithName(packageName, versionName),
                        crdUploads: [],
                        namePatternWithV: true,
                        valid: true
                    },
                    channelToAddVersion.name
                );
            } else {
                console.error('No channel set to add version to it');
            }
            // edit name
        } else {
            const versionMetadata = versions.find(version => version.version === initialVersionName);

            // @TODO: update update path on name change!!!!

            if (versionMetadata && channelToAddVersion) {
                // update CSV with new version
                const updatedCsv = _.cloneDeep(versionMetadata.csv);
                _.set(updatedCsv, 'spec.version', versionName);

                changePackageOperatorVersionName(
                    initialVersionName,
                    channelToAddVersion.name,
                    {
                        ...versionMetadata,
                        version: versionName,
                        csv: updatedCsv,
                        // replace version to keep "name" base unchanged!
                        name: versionMetadata.name.replace(initialVersionName, versionName)
                    });
            } else {
                console.error(`Can't find version to update for version name ${initialVersionName}`, versions);
            }
        }
        this.closeVersionNameModal();
    };

    onAddVersionConfirmed = (version: string, replaced: string, skips: string[], skipRange: string, useAsDefault: boolean) => {
        const { packageName, addOperatorVersion, makePackageOperatorVersionDefault } = this.props;
        const { channelToAddVersion } = this.state;

        const operator = getDefaultOperatorWithName(packageName, version);
        const name = `${packageName}.v${version}`;

        this.updateGraph(operator, replaced, skips, skipRange);

        if (channelToAddVersion) {
            addOperatorVersion(
                {
                    name,
                    version,
                    csv: operator,
                    crdUploads: [],
                    namePatternWithV: true,
                    valid: true
                },
                channelToAddVersion.name
            );
            if (useAsDefault) {
                makePackageOperatorVersionDefault(version, name, channelToAddVersion.name);
            }
        }

        this.closeAddVersionModal();
    };

    onDuplicateVersionConfirmed = (duplicateVersionName: string, replaced: string, skips: string[], skipRange: string, useAsDefault: boolean) => {
        const { versions, addOperatorVersion, makePackageOperatorVersionDefault } = this.props;
        const { channelToAddVersion, operatorVersionToDuplicate } = this.state;

        if (operatorVersionToDuplicate) {
            const updatedCsv = _.cloneDeep(operatorVersionToDuplicate.csv);

            _.set(updatedCsv, 'spec.version', duplicateVersionName);

            this.updateGraph(updatedCsv, replaced, skips, skipRange);

            const duplicate: PackageEditorOperatorVersionMetadata = {
                ...operatorVersionToDuplicate,
                name: operatorVersionToDuplicate.name.replace(operatorVersionToDuplicate.version, duplicateVersionName),
                version: duplicateVersionName,
                csv: updatedCsv,
                crdUploads: [
                    ...operatorVersionToDuplicate.crdUploads
                ]
            };

            if (channelToAddVersion) {
                addOperatorVersion(duplicate, channelToAddVersion.name);

                if (useAsDefault) {
                    makePackageOperatorVersionDefault(duplicate.version, duplicate.name, channelToAddVersion.name);
                }
            } else {
                console.error('No channel set to add version to it');
            }

        } else {
            console.error(`Can't find version to duplicate`, versions);
        }
        this.closeDuplicateVersionModal();
    };

    /**
     * Handles both adding new channel and editing channel name from Edit Channel Name modal
     */
    onEditChannelNameConfirmed = (name: string, originalName: string) => {
        const { updatePackageChannel, addPackageChannel } = this.props;

        if (originalName === '') {
            addPackageChannel(name);
        } else {
            updatePackageChannel(originalName, { name });
        }

        this.closeChannelNameModal();
    };

    onEditUpdateGraphConfirmed = (name: string, replaced: string, skips: string[], skipRange: string) => {
        const { updatePackageOperatorVersionUpgradePath } = this.props;
        const { channelToAddVersion, versionToEditUpdateGraph } = this.state;

        if (versionToEditUpdateGraph && channelToAddVersion) {
            const csv = _.cloneDeep(versionToEditUpdateGraph.csv);
            this.updateGraph(csv, replaced, skips, skipRange);

            const updateVersionMeta: PackageEditorOperatorVersionMetadata = {
                ...versionToEditUpdateGraph,
                csv
            };

            updatePackageOperatorVersionUpgradePath(
                updateVersionMeta,
                channelToAddVersion.name,
                skips,
                replaced && replaced,
                skipRange && skipRange // change empty string to undefined
            );
        } else {
            console.warn('Can\'t find relevant version metadata or channel in state. Something went wrong', versionToEditUpdateGraph, channelToAddVersion);
        }
        this.closeUpdateGraphModal();
    };

    private updateGraph(operator: Operator, replaced: string, skips: string[], skipRange: string) {
        const { versions } = this.props;
        const replacedVersion = versions.find(meta => meta.version === replaced);

        // update or remove replaces value
        _.set(operator, 'spec.replaces', replacedVersion && replacedVersion.name);

        const skippedVersionNames = skips
            .map(skip => {
                const meta = versions.find(meta => meta.version === skip);
                return meta && meta.name;
            })
            .filter(name => name) as string[];

        // replace list of skip versions
        _.set(operator, 'spec.skips', skippedVersionNames);

        // remove skip range if empty string is received
        _.set(operator, 'spec["olm.skipRange"]', skipRange ? skipRange : undefined);
    }

    setChannelAsDefault = (channelName: string) => {
        const { makePackageChannelDefault } = this.props;

        makePackageChannelDefault(channelName);
    };

    removeChannel = (channelName: string) => {
        const { removePackageChannel, showRemoveChannelConfirmationModal, hideConfirmModal } = this.props;

        // @TODO Validate that we have default channel when creating Bundle
        showRemoveChannelConfirmationModal(() => {
            hideConfirmModal();
            removePackageChannel(channelName);
        });
    };

    removeOperatorVersion = (channel: PackageEditorChannel, versionName: string) => {
        const { removeOperatorVersion, showRemoveVersionConfirmationModal, hideConfirmModal } = this.props;

        // @TODO Validate that we have default channel when creating Bundle
        showRemoveVersionConfirmationModal(() => {
            hideConfirmModal();
            removeOperatorVersion(versionName, channel.name);
        });
    };

    goToVersionEditor = (path: string, versionName: string) => {
        const { history, versions, storeEditorOperator, setVersionEditorCrdUploads } = this.props;

        const versionMetadata = versions.find(version => version.version === versionName);

        // push selected version data to standalone version editor reducer
        if (versionMetadata) {
            const csvUpload = convertVersionCsvToVersionUpload(versionMetadata);

            storeEditorOperator(versionMetadata.csv);
            setVersionEditorCrdUploads(
                convertVersionCrdsToVersionUploads(versionMetadata.crdUploads).concat(csvUpload)
            );

        } else {
            console.error(`Can't find metadata for version ${versionName}`, versions);
        }

        history.push(path);
    };

    onPackageLeave = (path: string) => {
        const { history, match, resetEditor, showClearConfirmationModal, hideConfirmModal } = this.props;

        showClearConfirmationModal(match.params.packageName, () => {
            hideConfirmModal();
            resetEditor();
            history.push(path);
        });

        return false;
    };

    restartAndClearAll = (e: React.MouseEvent) => {
        const { history, match, resetEditor, showClearConfirmationModal, hideConfirmModal } = this.props;
        e.preventDefault();

        showClearConfirmationModal(match.params.packageName, () => {
            hideConfirmModal();
            resetEditor();
            history.push('/packages');
        });
    };


    downloadPackageBundle = (e: React.MouseEvent) => {
        const { packageName, channels, versions, showMissingDefaultChannelConfirmationModal } = this.props;

        createPackageBundle(packageName, channels, versions, showMissingDefaultChannelConfirmationModal, this.generateAction);
    };

    closeChannelNameModal = () => this.setState({ channelNameToEdit: null });
    closeAddVersionModal = () => this.setState({
        addOperatorVersion: false,
        channelToAddVersion: null
    });
    closeVersionNameModal = () => this.setState({
        operatorVersionNameToEdit: null,
        channelToAddVersion: null
    });
    closeDuplicateVersionModal = () => this.setState({
        operatorVersionToDuplicate: null,
        channelToAddVersion: null
    });
    closeUpdateGraphModal = () => this.setState({ versionToEditUpdateGraph: null });

    allowDownload = (channels: PackageEditorChannel[], versions: PackageEditorOperatorVersionMetadata[]) => {
        const allChannelsValid = channels.every(channel => validateChannel(channel, versions));
        const allChannelsHaveDefaultVersion = channels.every(channel => channel.currentVersionFullName !== '');

        return allChannelsValid && allChannelsHaveDefaultVersion;
    };


    render() {
        const { history, match, channels, versions, versionsWithoutChannel } = this.props;
        const { channelNameToEdit, addOperatorVersion, operatorVersionNameToEdit, operatorVersionToDuplicate, versionToEditUpdateGraph } = this.state;

        const packageName = match.params.packageName;
        const versionsNames = versions.map(versionMetadata => versionMetadata.version).sort(compareVersions).reverse();

        const downloadEnabled = this.allowDownload(channels, versions);


        return (
            <PackageEditorPageWrapper
                pageId="oh-operator-package-editor-page"
                history={history}
                className="oh-operator-package-channels-editor-page"
                buttonBar={
                    <div className="oh-operator-package-editor-page__button-bar oh-package-channels-editor">
                        <button className="oh-button oh-button-primary" disabled={!downloadEnabled} onClick={this.downloadPackageBundle}>
                            Download Operator Package
                        </button>
                        <a className="oh-operator-editor-page__download-link" ref={this.setGenerateAction}/>
                        <button className="oh-button oh-button-secondary" onClick={this.restartAndClearAll}>
                            Clear All and Start New Package
                        </button>
                    </div>
                }
                header={
                    <React.Fragment>
                        <h1>{this.title}</h1>
                        <p>{this.desc}</p>
                    </React.Fragment>
                }
                breadcrumbs={[{
                    subpath: packageName,
                    label: packageName
                }]}
                onPackageLeave={this.onPackageLeave}
            >
                <div className="oh-package-channels-editor">
                    <div className="oh-package-channels-editor__title">
                        <h2>Channels</h2>
                        <a className="oh-package-channels-editor__add-link" href="#" onClick={this.addChannel}>
                            <Icon type="fa" name="plus-circle"/>
                            <span>Add Channel</span>
                        </a>
                    </div>
                    {
                        channels
                            .sort(this.sortChannelsByName('asc'))
                            .map(channel =>
                                <ChannelEditorChannel
                                    key={channel.name}
                                    packageName={packageName}
                                    channel={channel}
                                    versions={versions}
                                    versionsWithoutChannel={versionsWithoutChannel}
                                    editChannelName={this.editChannelName}
                                    addOperatorVersion={this.addOperatorVersion}
                                    setChannelAsDefault={this.setChannelAsDefault}
                                    removeChannel={this.removeChannel}
                                    goToVersionEditor={this.goToVersionEditor}
                                    editVersion={this.editOperatorVersionName}
                                    setVersionAsDefault={this.setVersionAsDefault}
                                    duplicateVersion={this.duplicateOperatorVersion}
                                    editUpdateGraph={this.editUpdateGraph}
                                    deleteVersion={this.removeOperatorVersion}
                                />
                            )
                    }
                </div>
                {channelNameToEdit !== null &&
                <EditChannelNameModal
                    name={channelNameToEdit}
                    onConfirm={this.onEditChannelNameConfirmed}
                    onClose={this.closeChannelNameModal}
                />
                }
                {addOperatorVersion &&
                <EditUpgradeGraphModal
                    title='Add Operator Version'
                    mode={EditUpdateGraphModalMode.Add}
                    versions={versionsNames}
                    onConfirm={this.onAddVersionConfirmed}
                    onClose={this.closeAddVersionModal}
                />
                }
                {operatorVersionNameToEdit !== null &&
                <EditVersionNameModal
                    headline='Edit Operator Version Name'
                    name={operatorVersionNameToEdit}
                    allVersions={versionsNames}
                    onConfirm={this.onEditOperatorVersionNameConfirmed}
                    onClose={this.closeVersionNameModal}
                />
                }
                {operatorVersionToDuplicate !== null &&
                <EditUpgradeGraphModal
                    title='Duplicate Operator Version'
                    name={operatorVersionToDuplicate.version}
                    mode={EditUpdateGraphModalMode.Duplicate}
                    currentVersion={operatorVersionToDuplicate.version}
                    versions={versionsNames}
                    replaces={_.get(operatorVersionToDuplicate.csv, 'spec.replaces')}
                    skips={_.get(operatorVersionToDuplicate.csv, 'spec.skips', [])}
                    skipRange={_.get(operatorVersionToDuplicate.csv, 'spec["olm.skipRange"]')}
                    onConfirm={this.onDuplicateVersionConfirmed}
                    onClose={this.closeDuplicateVersionModal}
                />
                }
                {versionToEditUpdateGraph !== null &&
                <EditUpgradeGraphModal
                    title='Edit Update Graph'
                    mode={EditUpdateGraphModalMode.Edit}
                    currentVersion={versionToEditUpdateGraph.version}
                    versions={versionsNames}
                    replaces={_.get(versionToEditUpdateGraph.csv, 'spec.replaces')}
                    skips={_.get(versionToEditUpdateGraph.csv, 'spec.skips', [])}
                    skipRange={_.get(versionToEditUpdateGraph.csv, 'spec["olm.skipRange"]')}
                    onConfirm={this.onEditUpdateGraphConfirmed}
                    onClose={this.closeUpdateGraphModal}
                />
                }
            </PackageEditorPageWrapper>
        );
    }
}

const mapStateToProps = (state: StoreState) => ({
    packageName: state.packageEditorState.packageName,
    channels: state.packageEditorState.channels,
    versions: state.packageEditorState.operatorVersions,
    versionsWithoutChannel: state.packageEditorState.versionsWithoutChannel
});

const mapDispatchToProps = dispatch => ({
    ...bindActionCreators(PackageChannelsEditorPageActions, dispatch)
});


export default connect(mapStateToProps, mapDispatchToProps)(PackageChannelsEditorPage);
