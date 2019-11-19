import React from 'react';
import classNames from 'classnames';

import { PackageEntry, PackageFileEntry, PackageDirectoryEntry } from '../../../utils/packageEditorTypes';


export interface PackageUploaderDropAreaProps {
    showGithubUpload: () => void
    showUploadWarning: (error: string) => void
    onUpload: (entires: PackageEntry[]) => void

}

interface PackageUploaderDropAreaState {
    dragOver: boolean
}

/**
 * Drop area for uploading files by draging them in
 */
class PackageUploaderDropArea extends React.PureComponent<PackageUploaderDropAreaProps, PackageUploaderDropAreaState> {

    static propTypes;

    state: PackageUploaderDropAreaState = {
        dragOver: false
    };

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

    /**
     * Read content and metadata about file in dropped package
     * @param entry - FileSystemFileEntry 
     */
    readFile = (entry, nested: boolean) => new Promise<PackageFileEntry>((resolve, reject) => {

        entry.file((file: File) => {
            let reader = new FileReader();

            reader.onload = () => {
                const fileEntry: PackageFileEntry = {
                    kind: 'file',
                    path: entry.fullPath,
                    name: file.name,
                    objectName: file.name.replace('.yaml', ''),
                    objectType: '',
                    nested,
                    content: reader.result as string
                };

                resolve(fileEntry);
            }
            reader.onerror = () => reject(reader.error);

            reader.readAsText(file);
        }, (e) => reject(e));
    });

    /**
     * Read out dropped dir content
     * @param entry - FileSystemDirectoryEntry 

     */
    readDir = entry => new Promise<PackageDirectoryEntry>((resolve) => {

        const directoryReader = entry.createReader();
        const directoryEntry: PackageDirectoryEntry = {
            kind: 'dir',
            path: entry.fullPath,
            name: entry.name,
            objectName: '/',
            objectType: 'Folder',
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

    /**
     * Read content of dropped directory using FileSystemApi
     * @param entry - FileSystemEntry 
     */
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


    /**
     * Validate package directory that it contains package file and at least one version dir
     */
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

                    if (foundDirectory && foundPackageFile) {
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


    render() {
        const { showGithubUpload } = this.props;
        const { dragOver } = this.state;

        const uploadFileClasses = classNames({
            'oh-drag-drop-box': true,
            'drag-over': dragOver
        });

        return (
            <React.Fragment>
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
                            <a href="#" className="oh-drag-drop-box__upload-file-box__link" onClick={showGithubUpload}>upload</a>
                        </label>
                        <span>from the Github.</span>
                    </form>
                </div>
            </React.Fragment>
        );
    }
}


export default PackageUploaderDropArea;
