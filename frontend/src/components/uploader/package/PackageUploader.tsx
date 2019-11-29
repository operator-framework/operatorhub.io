import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { safeLoad } from 'js-yaml';

import PackageUploaderDropArea from './PackageUploaderDropArea';
import { PackageEntry, PackageFileEntry, PackageDirectoryEntry, PackageEditorOperatorVersionsMap, PackageEditorOperatorVersionMetadata, PacakgeEditorChannel } from '../../../utils/packageEditorTypes';
import { StoreState, hideGithubPackageUploadAction } from '../../../redux';
import PackageUploaderObjectList from './PackageUploaderObjectList';

import * as actions from '../../../redux/actions';
import UploadPackageFromGithubModal from '../../modals/UploadPackageFromGithubModal';
import { PackageEditorState } from '../../../redux/packageEditorReducer';
import _ from 'lodash';

const operatorPackageUploaderActions = {
    setPackageName: actions.setPackageNameAction,
    setPackageUploads: actions.setPackageUploadsAction,
    removePackageUpload: actions.removePackageUploadAction,
    clearPackageUploads: actions.clearPackageUploadsAction,
    setPackageChannels: actions.setPackageChannelsAction,
    setPackageOperatorVersions: actions.setPackageOperatorVersionsAction,
    showGithubPackageUpload: actions.showGithubPackageUploadAction,
    hideGithubPackageUpload: actions.hideGithubPackageUploadAction,
    showErrorModal: actions.showUploaderErrorConfirmationModalAction,
    showClearConfirmationModal: actions.showClearConfirmationModalAction,
    hideConfirmationModal: actions.hideConfirmModalAction
};

type OperatorPackageUploaderDerivedProps = PackageEditorState;

type OperatorPackageUploaderActions = typeof operatorPackageUploaderActions;


export interface OperatorPackageUploaderProps extends OperatorPackageUploaderDerivedProps, OperatorPackageUploaderActions {
    onUploadChangeCallback: (isValid: boolean) => void
};


class OperatorPackageUploader extends React.PureComponent<OperatorPackageUploaderProps> {

    componentDidMount() {
        const { uploads, onUploadChangeCallback } = this.props;

        if (uploads.length > 0) {
            onUploadChangeCallback(true);
        }
    }

    /**
     * Parse file content and read out object type and name from file
     */
    deriveObjectMetadata = (data: string) => {

        let metadata = {
            type: 'Unknown',
            name: '',
            version: '',
            parsedContent: null
        };

        try {
            const content = metadata.parsedContent = safeLoad(data);

            // partial implementation (copied over...)
            // @see UploaderUtils -> getObjectNameAndType method for complete
            // identification of Kube objects
            if (content.kind && content.apiVersion && content.metadata) {

                const type = content.kind;
                const { name } = content.metadata;
                const apiName = content.apiVersion.substring(0, content.apiVersion.indexOf('/'));


                if (type === 'ClusterServiceVersion' && apiName === 'operators.coreos.com') {
                    metadata.name = name;
                    metadata.type = type;
                    metadata.version = content.spec.version;

                } else if (type === 'CustomResourceDefinition' && apiName === 'apiextensions.k8s.io') {
                    metadata.name = name;
                    metadata.type = type;
                }

            } else if (content.packageName && content.channels) {
                metadata.name = content.packageName;
                metadata.type = 'Package';
            }

        } catch (e) {
            console.warn('Failed to identify some kind of Operator package object!', data);
        }

        return metadata as {
            name: string,
            type: 'Package' | 'ClusterServiceVersion' | 'CustomResourceDefinition' | 'Unknown',
            parsedContent: any,
            version: string
        }
    }

    addFileMetadata = (entry: PackageFileEntry) => {
        const metadata = this.deriveObjectMetadata(entry.content);

        if (metadata.type === 'Unknown') {
            entry.errored = true;

        } else {
            entry.objectName = metadata.name;
            entry.objectType = metadata.type;
            entry.content = metadata.parsedContent;
            entry.version = metadata.version;
        }

        return entry;
    }

    /**
     * Parse uploaded file
     * @param upload upload metadata object
     */
    processUploadedObject = (entries: PackageEntry[]) => entries.map(entry => {

        // enhance based on derived data from file content
        if (entry.kind === 'file') {
            return this.addFileMetadata(entry);

        } else {
            // add metadata to files in version folder
            const enhancedDirEntry: PackageDirectoryEntry = {
                ...entry,
                content: entry.content.map(file => file.kind === 'file' ? this.addFileMetadata(file) : file)
            }

            return enhancedDirEntry;
        }
    });



    onPackageUpload = (entries: PackageEntry[]) => {
        const { setPackageUploads, onUploadChangeCallback, setPackageName } = this.props;
        const processedEntries = this.processUploadedObject(entries);

        const packageEntry = processedEntries.find(entry => entry.objectType === 'Package');
        const packageName = packageEntry ? packageEntry.objectName : '';

        setPackageUploads(processedEntries);
        setPackageName(packageName);
        // DUMB upload validation. Extend if required
        onUploadChangeCallback(processedEntries.some(entry => !entry.errored));
    }


    /**
     * Remove all uploaded files from the list
     */
    removeAllUploads = e => {
        const { clearPackageUploads, showClearConfirmationModal, hideConfirmationModal, onUploadChangeCallback } = this.props;
        e.preventDefault();

        showClearConfirmationModal(() => {
            clearPackageUploads();
            hideConfirmationModal();
            onUploadChangeCallback(false);
        });
    };

    /**
     * Remove specific upload by its index
     */
    removeUpload = (e: React.MouseEvent, path: string, nested: boolean) => {
        const { uploads, removePackageUpload, onUploadChangeCallback } = this.props;
        e.preventDefault();

        // ensure, that we notify page to disable create button if no upload left 
        // might become more complex validation later
        if (uploads.length === 1) {
            onUploadChangeCallback(false);
        }
        removePackageUpload(path, nested);
    };

    onGithubUploadError = (e: string) => {
        const { hideGithubPackageUpload, showErrorModal } = this.props;

        hideGithubPackageUpload();
        showErrorModal(e);
    }

    getOperatorCsvsFromUploads = (uploads: PackageEntry[]) => uploads.flatMap(upload => {

        if (upload.kind === 'dir') {
            return upload.content.filter(file => file.objectType === 'ClusterServiceVersion');
        }
        return [];
    });

    extractCrdUploadForVersion = (uploads: PackageEntry[], operatorVersion: string) => uploads
        .flatMap(upload => {

            if (upload.kind === 'dir' && upload.name === operatorVersion) {
                return upload.content.filter(file => file.objectType === 'CustomResourceDefinition');
            }
            return [];
        })
        .map(crdUpload => {
            return {
                name: crdUpload.objectName,
                crd: crdUpload.content
            };
        });

    buildOperatorVersionsMap = (uploads: PackageEntry[], operatorVersions: PackageFileEntry[]) => {
        return operatorVersions.reduce(
            (accumulator, operatorVersion) => {
console.log(operatorVersion)
                accumulator[operatorVersion.version] = {
                    name: operatorVersion.objectName,
                    csv: operatorVersion.content,
                    crdUploads: this.extractCrdUploadForVersion(uploads, operatorVersion.version)
                };

                return accumulator;
            },
            {} as PackageEditorOperatorVersionsMap
        );
    };


    convertUploadsToChannelsAndVersions = () => {
        const { uploads, setPackageChannels, setPackageOperatorVersions } = this.props;

        const channels: PacakgeEditorChannel[] = [];

        // get package file
        const pkg = uploads.find(upload => upload.objectType === 'Package') as PackageFileEntry | undefined;

        if (pkg && pkg.content) {
            const { content } = pkg;

            (content.channels || []).forEach((channel: { name: string, currentCSV: string }) => {
                channels.push({
                    name: channel.name,
                    isDefault: content.defaultChannel === channel.name,
                    versions: [],
                    currentVersionFullName: channel.currentCSV,
                    currentVersion: ''
                })
            });
        }

        // get all operator version uploads so we can search them
        const operatorVersions = this.getOperatorCsvsFromUploads(uploads);

        // list replaced versions in channel
        channels.forEach(channel => {
            console.log('aaaa')
            let csvEntry = operatorVersions.find(version => version.objectName === channel.currentVersionFullName);

            if(csvEntry){
                channel.currentVersion = csvEntry.version;
            }

            while (csvEntry) {                
                channel.versions.push(csvEntry.version);

                const replacedVersion = _.get(csvEntry, 'content.spec.replaces');
                csvEntry = operatorVersions.find(operatorVersion => operatorVersion.objectName === replacedVersion);
            }
        });

        setPackageChannels(channels);

        const operatorVersionsMap = this.buildOperatorVersionsMap(uploads, operatorVersions);

        setPackageOperatorVersions(operatorVersionsMap);
    }

    render() {
        const { uploads, showGithubPackageUpload, showErrorModal, hideGithubPackageUpload, githubUploadShown } = this.props;

        return (
            <React.Fragment>
                <div className="oh-operator-editor-page__section__header">
                    <div className="oh-operator-editor-page__section__header__text">
                        <p>
                            Drag and drop your entire Operator Package directory with Kubernetes YAML manifests.
                            The editor will parses and recognizes all the contained bundle versions and the associated channel definition.
                        </p>
                    </div>
                </div>
                <PackageUploaderDropArea
                    showGithubUpload={showGithubPackageUpload}
                    showUploadWarning={showErrorModal}
                    onUpload={this.onPackageUpload}
                />
                <PackageUploaderObjectList
                    uploads={uploads}
                    removeUpload={this.removeUpload}
                    removeAllUploads={this.removeAllUploads}
                />
                {githubUploadShown &&
                    <UploadPackageFromGithubModal
                        onUpload={this.onPackageUpload}
                        onClose={hideGithubPackageUpload}
                        onError={this.onGithubUploadError}
                    />
                }

            </React.Fragment>
        );
    }
}


const mapDispatchToProps = dispatch => ({
    ...bindActionCreators(operatorPackageUploaderActions, dispatch)
});

const mapStateToProps = (state: StoreState) => ({
    ...state.packageEditorState
});

export type OperatorPackageUploaderComponent = OperatorPackageUploader;

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { forwardRef: true }
)(OperatorPackageUploader);
