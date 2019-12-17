import React from 'react';
import { connect } from 'react-redux';
import { History } from 'history';
import { bindActionCreators } from 'redux';
import { match } from 'react-router';
import { Icon } from 'patternfly-react';
import JSZip from 'jszip';
import _ from 'lodash-es';

import PackageEditorPageWrapper from './pageWrapper/PackageEditorPageWrapper';
import { StoreState } from '../../redux';
import * as actions from '../../redux/actions';
import { PacakgeEditorChannel, PackageEditorOperatorVersionMetadata } from '../../utils/packageEditorTypes';
import ChannelEditorChannel from '../../components/packageEditor/channelsEditor/ChannelEditorChannel';
import EditChannelNameModal from '../../components/packageEditor/modals/EditChannelNameModal';
import { safeDump } from 'js-yaml';
import { removeEmptyOptionalValuesFromOperator } from '../../utils/operatorValidation';
import { yamlFromOperator } from '../operatorBundlePage/bundlePageUtils';
import EditVersionNameModal from '../../components/packageEditor/modals/EditVersionNameModal';
import { getDefaultOperatorWithName } from '../../utils/operatorUtils';
import { convertVersionCrdsToVersionUploads, validateOperatorVersions, validateChannel, convertVersionCsvToVersionUpload } from '../../utils/packageEditorUtils';

const PackageChannelsEditorPageActions = {
    showRemoveChannelConfirmationModal: actions.showRemoveChannelConfirmationModalAction,
    showRemoveVersionConfirmationModal: actions.showRemoveVersionConfirmationModalAction,
    showClearConfirmationModal: actions.showClearConfirmationModalAction,
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
    removeOperatorVersion: actions.removePackageOperatorVersionAction,
    storeEditorOperator: actions.storeEditorOperatorAction,
    setVersionEditorCrdUploads: actions.setUploadsAction
}

export type PackageChannelsEditorPageProps = {
    history: History
    match: match<{ packageName: string }>
} & typeof PackageChannelsEditorPageActions & ReturnType<typeof mapStateToProps>;


interface PackageChannelsEditorPageState {
    channelNameToEdit: string | null,
    operatorVersionNameToEdit: string | null,
    operatorVersionToDuplicate: string | null,
    channelToAddVersion: PacakgeEditorChannel | null
}



class PackageChannelsEditorPage extends React.PureComponent<PackageChannelsEditorPageProps, PackageChannelsEditorPageState>{


    state: PackageChannelsEditorPageState = {
        channelNameToEdit: null,
        operatorVersionNameToEdit: null,
        operatorVersionToDuplicate: null,
        channelToAddVersion: null
    }

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

    sortChannelsByName = (sorting: 'asc' | 'desc') => (a: PacakgeEditorChannel, b: PacakgeEditorChannel) => {
        const result = a.name.localeCompare(b.name);

        return sorting === 'asc' ? result : result * -1;
    }

    addChannel = (e: React.MouseEvent) => {
        e.preventDefault();

        this.setState({ channelNameToEdit: '' });
    }

    editChannelName = (channelName: string) => this.setState({ channelNameToEdit: channelName });

    addOperatorVersion = (channel: PacakgeEditorChannel) => this.setState({
        operatorVersionNameToEdit: '',
        channelToAddVersion: channel
    });

    duplicateOperatorVersion = (channel: PacakgeEditorChannel, originalVersion: string) => this.setState({
        channelToAddVersion: channel,
        operatorVersionToDuplicate: originalVersion
    });

    editOperatorVersionName = (channel: PacakgeEditorChannel, originalVersion: string) => this.setState({
        channelToAddVersion: channel,
        operatorVersionNameToEdit: originalVersion
    });

    setVersionAsDefault = (channel: PacakgeEditorChannel, versionName: string) => {
        const { versions, makePackageOperatorVersionDefault } = this.props;
        const targetVersion = versions.find(version => version.version === versionName);

        if (targetVersion) {
            makePackageOperatorVersionDefault(targetVersion.version, targetVersion.name, channel.name);
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
    }


    onDuplicateVersionConfirmed = (duplicateVersionName: string, originalVersionName: string) => {
        const { versions, addOperatorVersion } = this.props;
        const { channelToAddVersion } = this.state;

        const originalVersionMetadata = versions.find(version => version.version === originalVersionName);

        if (originalVersionMetadata) {
            const updatedCsv = _.cloneDeep(originalVersionMetadata.csv);
                _.set(updatedCsv, 'spec.version', duplicateVersionName);

            const duplicate: PackageEditorOperatorVersionMetadata = {
                ...originalVersionMetadata,
                name: originalVersionMetadata.name.replace(originalVersionName, duplicateVersionName),
                version: duplicateVersionName,
                csv: updatedCsv,
                crdUploads: [
                    ...originalVersionMetadata.crdUploads
                ]
            };

            if (channelToAddVersion) {
                addOperatorVersion(duplicate, channelToAddVersion.name);
            } else {
                console.error('No channel set to add version to it');
            }

        } else {
            console.error(`Can't find version to duplicate by version name ${originalVersionName}`, versions);
        }
        this.closeDuplicateVersionModal();
    }

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
    }

    setChannelAsDefault = (channelName: string) => {
        const { makePackageChannelDefault } = this.props;

        makePackageChannelDefault(channelName);
    }

    removeChannel = (channelName: string) => {
        const { removePackageChannel, showRemoveChannelConfirmationModal, hideConfirmModal } = this.props;

        // @TODO Validate that we have default channel when creating Bundle
        showRemoveChannelConfirmationModal(() => {
            hideConfirmModal();
            removePackageChannel(channelName)
        });
    }

    removeOperatorVersion = (channel: PacakgeEditorChannel, versionName: string) => {
        const { removeOperatorVersion, showRemoveVersionConfirmationModal, hideConfirmModal } = this.props;

        // @TODO Validate that we have default channel when creating Bundle
        showRemoveVersionConfirmationModal(() => {
            hideConfirmModal();
            removeOperatorVersion(versionName, channel.name)
        });
    }

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
    }

    restartAndClearAll = (e: React.MouseEvent) => {
        const { history, resetEditor, showClearConfirmationModal, hideConfirmModal } = this.props;
        e.preventDefault();

        showClearConfirmationModal(() => {
            hideConfirmModal();
            resetEditor();
            history.push('/packages');
        });
    }


    downloadPackageBundle = (e: React.MouseEvent) => {
        e.preventDefault();

        const { packageName, channels, versions, showMissingDefaultChannelConfirmationModal } = this.props;
        const haveDefaultChannel = channels.some(channel => channel.isDefault) || channels.length === 1;
        
        if(!haveDefaultChannel){
            showMissingDefaultChannelConfirmationModal();
            return;
        }

        const zip = new JSZip();

        const defaultChannel = channels.find(channel => channel.isDefault) || channels[0];
        const packageFileObject = {
            packageName,
            defaultChannel: defaultChannel.name,
            channels: channels.map(channel => ({
                name: channel.name,
                currentCSV: channel.currentVersionFullName
            }))
        };
        const pkgFolder = zip.folder(packageName);
        pkgFolder.file(`${packageName}.package.yaml`, safeDump(packageFileObject));

        versions.forEach(operatorVersion => {
            const versionFolder = pkgFolder.folder(operatorVersion.version);

            // remove values which are part of default operator, but are invalid
            const cleanedOperator = removeEmptyOptionalValuesFromOperator(operatorVersion.csv);

            let operatorYaml = '';
            try {
                operatorYaml = yamlFromOperator(cleanedOperator);
            } catch (e) {
                console.error('Failed to serialize operator csv.', e);
            }
            versionFolder.file(`${operatorVersion.name}.clusterserviceversion.yaml`, operatorYaml);

            // add CRDs
            operatorVersion.crdUploads.forEach(crd => {
                let crdYaml = '';
                let crdName = '';

                try {
                    crdYaml = safeDump(crd.crd);
                    crdName = crd.name;
                } catch (e) {
                    console.warn(`Can't convert crd to yaml for ${crdName} of version ${operatorVersion.version}`);
                }

                versionFolder.file(`${crdName}.crd.yaml`, crdYaml);
            });
        });


        zip.generateAsync({ type: 'base64' }).then(
            base64 => {
                if (this.generateAction) {
                    this.generateAction.href = `data:application/zip;base64,${base64}`;
                    this.generateAction.download = `${packageName}.bundle.zip`;
                    this.generateAction.click();
                } else {
                    console.error('Something went wrong with download. Please retry.');
                }
            },
            err => {
                console.error(err);
            }
        );
    }

    closeChannelNameModal = () => this.setState({ channelNameToEdit: null });
    closeVersionNameModal = () => this.setState({ operatorVersionNameToEdit: null, channelToAddVersion: null });
    closeDuplicateVersionModal = () => this.setState({ operatorVersionToDuplicate: null, channelToAddVersion: null });

    allowDownload = (channels: PacakgeEditorChannel[], versions: PackageEditorOperatorVersionMetadata[]) => {
        const allChannelsValid = channels.every(channel => validateChannel(channel, versions));
        const allChannelsHaveDefaultVersion = channels.every(channel => channel.currentVersionFullName !== '');        

        return allChannelsValid && allChannelsHaveDefaultVersion;
    }


    render() {
        const { history, match, channels, versions } = this.props;
        const { channelNameToEdit, operatorVersionNameToEdit, operatorVersionToDuplicate } = this.state;

        const packageName = match.params.packageName;
        const versionsNames = versions.map(versionMetadata => versionMetadata.version);
        const downloadEnabled = this.allowDownload(channels, versions);


        return (
            <PackageEditorPageWrapper
                pageId="oh-operator-package-editor-page"
                history={history}
                buttonBar={
                    <div className="oh-operator-package-editor-page__button-bar oh-package-channels-editor">
                        <button className="oh-button oh-button-primary" disabled={!downloadEnabled} onClick={this.downloadPackageBundle}>
                            Download Operator Package
                        </button>
                        <a className="oh-operator-editor-page__download-link" ref={this.setGenerateAction} />
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
            >
                <div className="oh-package-channels-editor">
                    <div className="oh-package-channels-editor__title">
                        <h2>Channels</h2>
                        <a className="oh-package-channels-editor__add-link" href="#" onClick={this.addChannel}>
                            <Icon type="fa" name="plus-circle" />
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
                                    editChannelName={this.editChannelName}
                                    addOperatorVersion={this.addOperatorVersion}
                                    setChannelAsDefault={this.setChannelAsDefault}
                                    removeChannel={this.removeChannel}
                                    goToVersionEditor={this.goToVersionEditor}
                                    editVersion={this.editOperatorVersionName}
                                    setVersionAsDefault={this.setVersionAsDefault}
                                    duplicateVersion={this.duplicateOperatorVersion}
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
                    />}
                {operatorVersionNameToEdit !== null &&
                    <EditVersionNameModal
                        name={operatorVersionNameToEdit}
                        allVersions={versionsNames}
                        onConfirm={this.onEditOperatorVersionNameConfirmed}
                        onClose={this.closeVersionNameModal}
                    />
                }
                {operatorVersionToDuplicate !== null &&
                    <EditVersionNameModal
                        name={operatorVersionToDuplicate}
                        allVersions={versionsNames}
                        onConfirm={this.onDuplicateVersionConfirmed}
                        onClose={this.closeDuplicateVersionModal}
                    />
                }
            </PackageEditorPageWrapper>
        );
    }
}

const mapStateToProps = (state: StoreState) => ({
    packageName: state.packageEditorState.packageName,
    channels: state.packageEditorState.channels,
    versions: state.packageEditorState.operatorVersions
});

const mapDispatchToProps = dispatch => ({
    ...bindActionCreators(PackageChannelsEditorPageActions, dispatch)
});


export default connect(mapStateToProps, mapDispatchToProps)(PackageChannelsEditorPage);