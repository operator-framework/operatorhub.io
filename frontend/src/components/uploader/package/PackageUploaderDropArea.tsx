import React from 'react';
import classNames from 'classnames';
import { Alert } from 'patternfly-react';

import { advancedUploadAvailable, supportFileSystemEntry, noop } from '../../../common/helpers';
import UploadUrlModal from '../../modals/UploadUrlModal';
import { PackageEntry, PackageFileEntry, PackageDirectoryEntry } from '../../../utils/packageEditorTypes';


export interface PackageUploaderDropAreaProps {
    onUpload: (entires: PackageEntry[]) => void
    onUrlDownload: (contents: string, url: string) => void
    createFromScratch: () => void
}

interface PackageUploaderDropAreaState {
    dragOver: boolean
    supportFileSystemEntry: boolean
    uploadUrlShown: boolean
}

/**
 * Drop area for uploading files by draging them in
 */
class PackageUploaderDropArea extends React.PureComponent<PackageUploaderDropAreaProps, PackageUploaderDropAreaState> {

    static propTypes;

    state: PackageUploaderDropAreaState = {
        dragOver: false,
        supportFileSystemEntry: false,
        uploadUrlShown: false
    };

    componentDidMount() {
        // we need extra support for traversing directory structure in uploaded folder
        this.setState({ supportFileSystemEntry: advancedUploadAvailable() && supportFileSystemEntry() });
    }

    /**
     * Visually notify user where to drop files on drag over
     */
    highlightOnDragEnter = (e: React.DragEvent) => {
        this.handleDragDropEvent(e);
        this.setState({ dragOver: true });
    };

    clearOnDragLeave = (e: React.DragEvent) => {
        this.handleDragDropEvent(e);
        this.setState({ dragOver: false });
    };

    handleDragDropEvent = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    readFile = (entry, nested: boolean) => new Promise<PackageFileEntry>((resolve, reject) => {

        entry.file((file: File) => {
            let reader = new FileReader();

            reader.onload = () => {

                resolve({
                    type: 'file',
                    path: entry.fullPath,
                    name: file.name,
                    objectName: file.name.replace('.yaml', ''),
                    nested,                    
                    content: reader.result as string
                });
            }
            reader.onerror = () => reject(reader.error);

            reader.readAsText(file);
        }, (e) => reject(e));
    });

    readDir = entry => new Promise<PackageDirectoryEntry>((resolve) => {

        const directoryReader = entry.createReader();
        const directoryEntry: PackageDirectoryEntry = {
            type: 'dir',
            path: entry.fullPath,
            name: entry.name,
            objectName: '/',
            nested: false,
            content: []
        }

        directoryReader.readEntries((entries: any[]) => {

            const filePromises: Promise<PackageFileEntry>[] = [];

            entries.forEach(entry => {

                if (entry.isFile) {
                    filePromises.push(this.readFile(entry, true));
                }
            });

            Promise.all(filePromises).then(fileEntries => {
                directoryEntry.content = fileEntries;

                resolve(directoryEntry);
            })
        });
    })

    listContent = (entry: any) => new Promise<PackageEntry[]>((resolve) => {
        const directoryReader = entry.createReader();

        directoryReader.readEntries((entries: any[]) => {
            // promises with files and folders content
            const readPromises: (Promise<PackageEntry>)[] = [];

            entries.forEach(entry => {

                if (entry.isFile) {
                    readPromises.push(this.readFile(entry, false));

                } else if (entry.isDirectory) {
                    readPromises.push(this.readDir(entry));
                }
            });

            Promise.all(readPromises).then(entries => {
                resolve(entries);
            });
        });
    });


    isValidPackageDir = (entry: any) => new Promise<boolean>((resolve, reject) => {

        if (entry.isDirectory) {
            const directoryReader = entry.createReader();


            directoryReader.readEntries((entries: any[]) => {

                // expect at least package file and one dir with operator version
                if (entries.length > 1) {

                    // NAIVE validation without reading files
                    // if needed we can extend it to check package file content
                    const foundPackageFile = entries.some(entry => entry.isFile);
                    const foundDirectory = entries.some(entry => entry.isDirectory);

                    if(foundDirectory && foundPackageFile){
                        resolve();
                    } else {
                        reject('Directory has to contiant package file and version folder.');
                    }

                } else {
                    reject('Directory has to contiant package file and version folder.');
                }
            });
        } else {
            reject('Invalid directory. Has to be package root directory.');
        }

    });



    /**
     * Upload files on drop
     */
    onDropEvent = (e: React.DragEvent) => {
        const { onUpload } = this.props;
        const items = e.dataTransfer.items;
        const entry = items[0].webkitGetAsEntry();

        this.handleDragDropEvent(e);

        if (items.length > 1) {
            // @TODO show warning that only single dir should be used!
        } else {

            this.isValidPackageDir(entry)
                .then(() => {
                    console.log('dir', entry.name, entry);

                    return this.listContent(entry);

                })
                .then(entries => {
                    onUpload(entries);
                })
                .catch(e => {
                    console.log(e);
                    // @TODO show warning
                })
        }

    };

    showUploadUrl = (e: React.MouseEvent) => {
        e.preventDefault();
        this.setState({ uploadUrlShown: true });
    };

    hideUploadUrl = () => {
        this.setState({ uploadUrlShown: false });
    };

    onUrlDownloaded = (contents: string, url: string) => {
        const { onUrlDownload } = this.props;

        this.setState({ uploadUrlShown: false });

        onUrlDownload(contents, url);
    };

    onCreateFromScratch = (e: React.MouseEvent) => {
        const { createFromScratch } = this.props;
        e.preventDefault();

        createFromScratch();
    }

    render() {
        const { } = this.props;
        const { dragOver, supportFileSystemEntry, uploadUrlShown } = this.state;

        const uploadFileClasses = classNames({
            'oh-file-upload_empty-state': true,
            'oh-drag-drop-box': true,
            'drag-over': dragOver,
            'oh-folder-upload-disabled': !supportFileSystemEntry
        });

        return (
            <React.Fragment>
                {
                    !supportFileSystemEntry && (
                        <Alert type="warning">
                            <p>The Folder Uploader is not compatible with the browser you are using. Use Google Chrome, Mozila Firefox or Microsoft Edge
                            instead for uploading your entire package folder.
                            Your can upload package folder from &nbsp;
                          <a href="#" className="oh-drag-drop-box__upload-file-box__link" onClick={this.showUploadUrl}>Github community operators repository.</a>
                                Alternatively, you can <a href="#" onClick={this.onCreateFromScratch}>create your Operator Package from Scratch.</a>
                            </p>
                        </Alert>
                    )
                }
                <div className="oh-file-upload__form">
                    <div className={uploadFileClasses}>
                        <form
                            className="oh-drag-drop-box__upload-file-box"
                            method="post"
                            action=""
                            encType="multipart/form-data"
                            onDrag={this.handleDragDropEvent}
                            onDragStart={this.handleDragDropEvent}
                            onDragEnd={this.handleDragDropEvent}
                            onDragOver={this.highlightOnDragEnter}
                            onDragEnter={this.highlightOnDragEnter}
                            onDragLeave={this.clearOnDragLeave}
                            onDrop={this.onDropEvent}
                        >
                            <span>Drag your file here to upload, or</span>
                            <label>
                                <a href="#" className="oh-drag-drop-box__upload-file-box__link" onClick={this.showUploadUrl}>upload</a>
                            </label>
                            <span>from the Github community operators repository.</span>
                        </form>
                    </div>
                    {uploadUrlShown && <UploadUrlModal onUpload={this.onUrlDownloaded} onClose={this.hideUploadUrl} />}
                </div>
            </React.Fragment>
        );
    }
}


export default PackageUploaderDropArea;
