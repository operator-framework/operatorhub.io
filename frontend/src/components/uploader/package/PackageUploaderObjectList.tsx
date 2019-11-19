import React from 'react';
import { Grid, Icon } from 'patternfly-react';
import UploaderStatusIcon, { IconStatus } from '../UploaderStatusIcon';
import { PackageEntry } from '../../../utils/packageEditorTypes';
import PackageUploaderFolderIcon, { PackageUploaderFolderIconStatus } from './PackageUploaderFolderIcon';

export interface PackageUploaderObjectListProps {
    uploads: PackageEntry[]
    removeUpload: (e: React.MouseEvent, path: string, nested: boolean) => void
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

    /**
     * Toggles expanded state on dir
     */
    toggleFolderExpanded = (e: React.MouseEvent, key: string) => {
        const { expanded } = this.state;

        e.preventDefault();

        const index = expanded.indexOf(key);
        let newExpandedKeys: string[];

        if (index > -1) {
            newExpandedKeys = expanded.filter(value => value !== key);

        } else {
            newExpandedKeys = expanded.concat(key);
        }

        this.setState({
            expanded: newExpandedKeys
        });
    }

    /**
     * Curried function 
     * Add content of expanded version dirs into to the entries array so they are shown in list
     */
    showNestedFilesOnExpandedDirs = (expanded: string[]) => (upload: PackageEntry) => {

        if (upload.kind === 'dir') {
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
    }

    render() {
        const { uploads, removeUpload, removeAllUploads } = this.props;
        const { expanded } = this.state;

        if (uploads.length === 0) {
            return null;
        }

        const addExpanded = this.showNestedFilesOnExpandedDirs(expanded);

        return (
            <Grid fluid className="oh-operator-editor-upload__uploads">
                <Grid.Row className="oh-operator-editor-upload__uploads__row">
                    <Grid.Col xs={3}>Name</Grid.Col>
                    <Grid.Col xs={3}>Object Name</Grid.Col>
                    <Grid.Col xs={3}>Object Type</Grid.Col>
                    <Grid.Col xs={2}>Status</Grid.Col>
                    <Grid.Col xs={1} className="oh-operator-editor-upload__uploads__actions-col">
                        <a href="#" onClick={removeAllUploads}>
                            <span>Remove All</span>
                        </a>
                    </Grid.Col>
                </Grid.Row>
                {uploads
                    .flatMap(addExpanded)
                    .map((upload: PackageEntry) => {
                        const isDir = upload.kind === "dir";
                        const folderState = upload.opened ? PackageUploaderFolderIconStatus.OPENED : PackageUploaderFolderIconStatus.CLOSED;

                        return (<Grid.Row className="oh-operator-editor-upload__uploads__row" key={upload.path}>
                            <Grid.Col
                                xs={3}
                                className="oh-operator-editor-upload__uploads__row__name"
                                title={upload.name}
                            >
                                {upload.nested && <span className="oh-operator-editor-upload__uploads__nested-space">&nbsp;</span>}
                                {isDir && (
                                    <span onClick={e => this.toggleFolderExpanded(e, upload.path)}>
                                        <PackageUploaderFolderIcon status={folderState} />
                                    </span>
                                )}
                                {upload.name}
                            </Grid.Col>
                            <Grid.Col xs={3} className="oh-operator-editor-upload__uploads__row__file" title={upload.objectName}>
                                {upload.objectName}
                            </Grid.Col>
                            <Grid.Col xs={3} className="oh-operator-editor-upload__uploads__row__type" title={upload.objectType}>
                                {upload.objectType}
                            </Grid.Col>
                            <Grid.Col xs={2}>
                                <UploaderStatusIcon text="Supported Object" status={upload.errored ? IconStatus.ERROR : IconStatus.SUCCESS} />
                            </Grid.Col>
                            <Grid.Col xs={1} className="oh-operator-editor-upload__uploads__actions-col">
                                <a href="#" onClick={e => removeUpload(e, upload.path, upload.nested)}>
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
