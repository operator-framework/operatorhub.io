import React from 'react';
import { Grid, Icon } from 'patternfly-react';
import UploaderStatusIcon, { IconStatus } from '../UploaderStatusIcon';
import { PackageEntry } from '../../../utils/packageEditorTypes';
import PackageUploaderFolderIcon, { PackageUploaderFolderIconStatus } from './PackageUploaderFolderIcon';
import PackageUploaderFileIcon from './PackageUploaderFileIcon';

export interface PackageUploaderObjectListProps {
    uploads: PackageEntry[]
    removeUpload: (e: React.MouseEvent, id: string) => void
    removeAllUploads: (e: React.MouseEvent) => void
}

interface PackageUploaderObjectListState {
    expanded: string[]
}

/**
 * List uploaded and missing files
 */
class PackageUploaderObjectList extends React.PureComponent<PackageUploaderObjectListProps, PackageUploaderObjectListState>{

    state: PackageUploaderObjectListState = {
        expanded: []
    };

    toggleFolderExpanded = (e: React.MouseEvent, key: string) => {
        const { expanded } = this.state;

        e.preventDefault();

        const index = expanded.indexOf(key);
        let newExpandedKeys: string[];

        if (index > -1) {

            newExpandedKeys = [
                ...expanded.slice(0, index),
                ...expanded.slice(index + 1)
            ];

        } else {
            newExpandedKeys = expanded.concat(key);
        }

        this.setState({
            expanded: newExpandedKeys
        });
    }

    render() {
        const { uploads, removeUpload, removeAllUploads } = this.props;
        const { expanded } = this.state;

        if (uploads.length === 0) {
            return null;
        }

        return (
            <Grid fluid className="oh-operator-editor-upload__uploads">
                <Grid.Row className="oh-operator-editor-upload__uploads__row">
                    <Grid.Col xs={3}>Name</Grid.Col>
                    <Grid.Col xs={3}>Object Name</Grid.Col>
                    <Grid.Col xs={3}>Object Type</Grid.Col>
                    <Grid.Col xs={2}>Status</Grid.Col>
                    <Grid.Col xs={1} className="oh-operator-editor-upload__uploads__actions-col">
                        <a href="#" onClick={removeAllUploads}>
                            <Icon type="fa" name="trash" />
                            <span>Remove All</span>
                        </a>
                    </Grid.Col>
                </Grid.Row>
                {uploads
                    .flatMap(upload => {

                        if (upload.type === 'dir') {
                            const opened = expanded.some(value => value === upload.path);

                            
                            if (!opened) {
                                return [upload];
                            
                            // add file list only when folder gets expanded
                            } else {
                                return [
                                    {
                                        ...upload,
                                        opened
                                    } as PackageEntry
                                ].concat(upload.content);
                            }

                        }
                        return [upload];
                    })
                    .map((upload: PackageEntry) => {
                        const isDir = upload.type === "dir";
                        const folderState = upload.opened ? PackageUploaderFolderIconStatus.OPENED : PackageUploaderFolderIconStatus.CLOSED;

                        return (<Grid.Row className="oh-operator-editor-upload__uploads__row" key={upload.path}>
                            <Grid.Col
                                xs={3}
                                className="oh-operator-editor-upload__uploads__row__name"
                                title={upload.name}
                            >
                                {upload.nested && <span className="oh-operator-editor-upload__uploads__nested-space">&nbsp;</span>}
                                {
                                    isDir ?
                                        <span onClick={e => this.toggleFolderExpanded(e, upload.path)}>
                                            <PackageUploaderFolderIcon status={folderState} />
                                        </span>
                                        :
                                        null
                                }
                                {upload.name}
                            </Grid.Col>
                            <Grid.Col xs={3} className="oh-operator-editor-upload__uploads__row__file" title={upload.objectName}>
                                {upload.objectName}
                            </Grid.Col>
                            <Grid.Col xs={3} className="oh-operator-editor-upload__uploads__row__type" title={upload.type}>
                                {upload.type}
                            </Grid.Col>
                            <Grid.Col xs={2}>
                                <UploaderStatusIcon text="Supported Object" status={IconStatus.SUCCESS} />
                            </Grid.Col>
                            <Grid.Col xs={1} className="oh-operator-editor-upload__uploads__actions-col">
                                <a href="#" onClick={e => removeUpload(e, upload.path)}>
                                    <Icon type="fa" name="trash" />
                                    <span className="sr-only">Remove</span>
                                </a>
                            </Grid.Col>
                        </Grid.Row>
                        )
                    })
                }
            </Grid>
        );
    }
}

export default PackageUploaderObjectList;
