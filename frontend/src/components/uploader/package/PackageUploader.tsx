import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { safeLoad } from 'js-yaml';

import PackageUploaderDropArea from './PackageUploaderDropArea';
import { PackageEntry, PackageFileEntry, PackageDirectoryEntry } from '../../../utils/packageEditorTypes';
import { StoreState } from '../../../redux';
import PackageUploaderObjectList from './PackageUploaderObjectList';

import * as actions from '../../../redux/actions';

const operatorPackageUploaderActions = {
    setPackageUploads: actions.setPackageUploadsAction,
    removePackageUpload: actions.removePackageUploadAction,
    clearPackageUploads: actions.clearPackageUploadsAction,
    showGithubPackageUpload: actions.showGithubPackageUploadAction,
    hideGithubPackageUpload: actions.hideGithubPackageUploadAction,
    showErrorModal: actions.showUploaderErrorConfirmationModalAction,
    showClearConfirmationModal: actions.showClearConfirmationModalAction,
    hideConfirmationModal: actions.hideConfirmModalAction

};



interface OperatorPackageUploaderDerivedProps {
    uploads: PackageEntry[]
}

type OperatorPackageUploaderActions = typeof operatorPackageUploaderActions;


export interface OperatorPackageUploaderProps extends OperatorPackageUploaderDerivedProps, OperatorPackageUploaderActions {
    onUploadChangeCallback: (isValid: boolean) => void
 };


class OperatorPackageUploader extends React.PureComponent<OperatorPackageUploaderProps> {


    /**
     * Parse file content and read out object type and name from file
     */
    deriveObjectMetadata = (data: string) => {

        let metadata = {
            type: 'Unknown',
            name: '',
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

        return metadata;
    }

    addFileMetadata = (entry: PackageFileEntry) => {
        const metadata = this.deriveObjectMetadata(entry.content);

        if (metadata.type === 'Unknown') {
            entry.errored = true;

        } else {
            entry.objectName = metadata.name;
            entry.objectType = metadata.type;
            entry.content = metadata.parsedContent;
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
        const { setPackageUploads, onUploadChangeCallback } = this.props;
        const processedEntries = this.processUploadedObject(entries);

        setPackageUploads(processedEntries);
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
        const {uploads, removePackageUpload, onUploadChangeCallback} = this.props;
        e.preventDefault();
        
        // ensure, that we notify page to disable create button if no upload left 
        // might become more complex validation later
        if(uploads.length === 1){
            onUploadChangeCallback(false);
        }
        removePackageUpload(path, nested);
    };


    render() {
        const { uploads, showGithubPackageUpload, showErrorModal } = this.props;

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
                {/* {gitUploadShown && <UploadUrlModal onUpload={this.onUrlDownloaded} onClose={this.hideUploadUrl} />} */}

            </React.Fragment>
        );
    }
}


const mapDispatchToProps = dispatch => ({
    ...bindActionCreators(operatorPackageUploaderActions, dispatch)
});

const mapStateToProps = (state: StoreState) => ({
    uploads: state.packageEditorState.uploads
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OperatorPackageUploader);
