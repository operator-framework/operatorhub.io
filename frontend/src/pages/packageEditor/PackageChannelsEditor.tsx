import React from 'react';
import { connect } from 'react-redux';
import { History } from 'history';
import { bindActionCreators } from 'redux';
import { match } from 'react-router';
import { Icon } from 'patternfly-react';
import JSZip from 'jszip';


import PackageEditorPageWrapper from './pageWrapper/PackageEditorPageWrapper';
import { StoreState, updatePackageChannelAction, addNewPackageChannelAction, makePackageChannelDefaultAction, removePackageChannelAction, resetPackageEditorAction } from '../../redux';
import { PacakgeEditorChannel } from '../../utils/packageEditorTypes';
import ChannelEditorChannel from '../../components/packageEditor/channelsEditor/ChannelEditorChannel';
import EditChannelNameModal from '../../components/packageEditor/channelsEditor/EditNameModal';
import { safeDump } from 'js-yaml';
import { removeEmptyOptionalValuesFromOperator } from '../../utils/operatorValidation';
import { yamlFromOperator } from '../operatorBundlePage/bundlePageUtils';


const PackageChannelsEditorPageActions = {
    updatePackageChannel: updatePackageChannelAction,
    addPackageChannel: addNewPackageChannelAction,
    makePackageChannelDefault: makePackageChannelDefaultAction,
    removePackageChannel: removePackageChannelAction,
    resetEditor: resetPackageEditorAction
}

export type PackageChannelsEditorPageProps = {
    history: History
    match: match<{ packageName: string }>
} & typeof PackageChannelsEditorPageActions & ReturnType<typeof mapStateToProps>;


interface PackageChannelsEditorPageState {
    downloadEnabled: boolean,
    channelNameToEdit: string | null
}



class PackageChannelsEditorPage extends React.PureComponent<PackageChannelsEditorPageProps, PackageChannelsEditorPageState>{


    state: PackageChannelsEditorPageState = {
        downloadEnabled: true,
        channelNameToEdit: null
    }

    title = 'Package Definition';

    desc = `The package definition contains information about channels to a particular version of ClusterServiceVersion (CSV) within
    the directory of a particular Operator Version. Channels allow you to specify different upgrade paths for different users 
    (e.g. alpha vs. stable).`;


    generateAction: HTMLAnchorElement | null = null;

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

    editChannelName = (channelName: string) => {
        this.setState({ channelNameToEdit: channelName });
    }

    addOperatorVersion = (channelName: string) => {

    }

    closeChannelNameModal = () => {
        this.setState({ channelNameToEdit: null });
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
        const { removePackageChannel } = this.props;

        // @TODO Validate that we have default channel when creating Bundle
        removePackageChannel(channelName);
    }

    restartAndClearAll = (e: React.MouseEvent) => {
        const { history, resetEditor } = this.props;

        e.preventDefault();

        resetEditor();
        history.push('/packages');
    }

    downloadPackageBundle = (e: React.MouseEvent) => {
        e.preventDefault();
        
        const { packageName, channels, versions } = this.props;
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

        Object.values(versions).forEach(operatorVersion => {
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



    render() {
        const { history, match, channels } = this.props;
        const { downloadEnabled, channelNameToEdit } = this.state;

        const packageName = match.params.packageName;

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
                                    editChannelName={this.editChannelName}
                                    addOperatorVersion={this.addOperatorVersion}
                                    setChannelAsDefault={this.setChannelAsDefault}
                                    removeChannel={this.removeChannel}
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