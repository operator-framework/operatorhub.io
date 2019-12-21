import React from 'react';
import { DropdownKebab, MenuItem, Grid, Icon } from 'patternfly-react';
import satisfies from 'semver/functions/satisfies';

import ChannelEditorChannelIcon from './ChannelEditorChannelIcon';
import PackageUploaderSortIcon from '../../uploader/package/PackageUploaderSortIcon';
import { PacakgeEditorChannel, PackageEditorOperatorVersionMetadata, PackageEditorUpdatePath } from '../../../utils/packageEditorTypes';
import UploaderStatusIcon, { IconStatus } from '../../uploader/UploaderStatusIcon';
import { validateChannel, getVersionFromName } from '../../../utils/packageEditorUtils';
import UpdatePath from './VersionUpdatePath';



export type ChannelEditorChannelProps = {
    packageName: string,
    channel: PacakgeEditorChannel,
    versions: PackageEditorOperatorVersionMetadata[],
    editChannelName: (channelName: string) => void
    addOperatorVersion: (channel: PacakgeEditorChannel) => void
    setChannelAsDefault: (channelName: string) => void
    removeChannel: (channelName: string) => void
    goToVersionEditor: (versionPath: string, versionName: string) => void
    duplicateVersion: (channel: PacakgeEditorChannel, version: string) => void
    editVersion: (channel: PacakgeEditorChannel, version: string) => void
    setVersionAsDefault: (channel: PacakgeEditorChannel, version: string) => void
    deleteVersion: (channel: PacakgeEditorChannel, version: string) => void
};


interface ChannelEditorChannelState {
    expanded: boolean,
    sorting: 'asc' | 'desc'
}


class ChannelEditorChannel extends React.PureComponent<ChannelEditorChannelProps, ChannelEditorChannelState>{


    state: ChannelEditorChannelState = {
        expanded: false,
        sorting: 'desc'
    }

    updatePathDrawnIndex: number = 0;

    toggleExpand = (e: React.MouseEvent) => {
        const { expanded } = this.state;
        e.preventDefault();

        this.setState({ expanded: !expanded });
    }


    toggleSorting = (e: React.MouseEvent) => {
        const { sorting } = this.state;
        e.preventDefault();

        this.setState({
            sorting: sorting === 'asc' ? 'desc' : 'asc'
        });
    }

    sortVersions = (sorting: 'asc' | 'desc') => (a: string, b: string) => {
        const result = a.localeCompare(b);

        return sorting === 'asc' ? result : result * -1;
    }

    addOperatorVersion = (e: React.MouseEvent) => {
        const { channel, addOperatorVersion } = this.props;
        e.preventDefault();
        addOperatorVersion(channel);
    }


    editChannelName = (e: React.MouseEvent) => {
        const { channel, editChannelName } = this.props;
        e.preventDefault();

        editChannelName(channel.name);
    }

    setChannelAsDefault = (e: React.MouseEvent) => {
        const { channel, setChannelAsDefault } = this.props;
        e.preventDefault();

        setChannelAsDefault(channel.name);
    }

    deleteChannel = (e: React.MouseEvent) => {
        const { channel, removeChannel } = this.props;
        e.preventDefault();

        removeChannel(channel.name);
    }

    goToVersionEditor = (e: React.MouseEvent, path: string, version: string) => {
        const { goToVersionEditor } = this.props;
        e.preventDefault();

        goToVersionEditor(path, version);
    }

    duplicateVersion = (e: React.MouseEvent, version: string) => {
        const { channel, duplicateVersion } = this.props;
        e.preventDefault();
        duplicateVersion(channel, version);
    }

    editVersion = (e: React.MouseEvent, version: string) => {
        const { channel, editVersion } = this.props;
        e.preventDefault();
        editVersion(channel, version);
    }

    setVersionAsDefault = (e: React.MouseEvent, version: string) => {
        const { channel, setVersionAsDefault } = this.props;
        e.preventDefault();
        setVersionAsDefault(channel, version);
    }

    deleteVersion = (e: React.MouseEvent, version: string) => {
        const { channel, deleteVersion } = this.props;
        e.preventDefault();
        deleteVersion(channel, version);
    }

    calculateVersionsDistance = (versions: string[], targetVersion: string, sourceVersion: string) => {
        const targetIndex = versions.indexOf(targetVersion);
        const sourceIndex = versions.indexOf(sourceVersion);

        let distance = 0;

        if (targetIndex > -1 && sourceIndex > -1) {
            distance = Math.abs(sourceIndex - targetIndex);
        }

        return distance;
    }

    buildUpdateGraph = (versionMetadatas: PackageEditorOperatorVersionMetadata[], versions: string[]) => {

        const versionsToSkip: string[] = [];
        let updateGraph: PackageEditorUpdatePath[] = [];

        versions.forEach(version => {

            // skip skipped version - do not draw update path to it as it gets ignored
            if (versionsToSkip.includes(version)) {
                return;
            }

            const versionMetadata = versionMetadatas.find(meta => meta.version === version);

            if (versionMetadata) {
                const { csv } = versionMetadata;
                const { spec } = csv;

                const skips = spec && spec.skips || [];

                if (skips.length > 0) {
                    skips.forEach(skip => {
                        const skippedVersion = getVersionFromName(skip);

                        if (skippedVersion) {
                            versionsToSkip.push(skippedVersion);

                            // updateGraph.push({
                            //     id: `${version}-${skippedVersion}`,
                            //     target: version,
                            //     source: skippedVersion,
                            //     distance: this.calculateVersionsDistance(versions, version, skippedVersion),
                            //     index: 0
                            // });
                        }
                    })
                }

                const skipRange = spec && spec['olm.skipRange'] || '';

                if (skipRange) {
                    const skippedByRange: string[] = [];
                    let skipPath: PackageEditorUpdatePath | null = null;

                    versions.forEach(skip => {
                        if (satisfies(skip, skipRange)) {

                            skippedByRange.push(skip);
                            skipPath = {
                                id: `${version}-${skip}`,
                                target: version,
                                source: skip,
                                distance: this.calculateVersionsDistance(versions, version, skip),
                                index: 0
                            };
                        }
                    });
                   // console.log(skippedByRange);

                    skipPath && updateGraph.push(skipPath);

                    if(skippedByRange.length > 0){
                        const skippedWithoutLast = skippedByRange.slice(0, skippedByRange.length - 1);
                        // do not skip last version as we need it to continue building update path
                        // intermediate version will be skipped by range so are unimportant
                        versionsToSkip.push(...skippedWithoutLast);

                       // console.log(skippedWithoutLast)
                    }
                }

                const replaces = spec && csv.spec.replaces || '';
                const replacedVersion = getVersionFromName(replaces);

                if (replacedVersion) {
                    updateGraph.push({
                        id: `${version}-${replacedVersion}`,
                        target: version,
                        source: replacedVersion,
                        distance: this.calculateVersionsDistance(versions, version, replacedVersion),
                        index: 0
                    });
                }
            }
        });
        const graphIds = new Set<string>();

        updateGraph = updateGraph
            .filter(path => path.distance)    
            // deduplicate paths - same path might be created by skip/replaces/skipRange
            .filter(path => {
                if(graphIds.has(path.id)){
                    return false;

                } else {
                    graphIds.add(path.id);
                    return true;
                }
            })      
            .map((path, index) => ({
                ...path,
                index
            }))

        console.log(updateGraph);
        return updateGraph;
    }

    drawUpdatePaths = (updateGraph: PackageEditorUpdatePath[], version: string) => {
        const { sorting } = this.state;

        const versionRelavantPaths = updateGraph.filter(path => path.target === version);

        return versionRelavantPaths.map(path => (
            <UpdatePath
                key={`${path.target}-${path.source}`}
                index={path.index}
                distance={path.distance}
                sortingDirection={sorting}
            />
        ));
    }

    render() {
        const { packageName, channel, versions } = this.props;
        const { expanded, sorting } = this.state;

        const versionsInChannelAreValid = validateChannel(channel, versions);
        const hasDefaultVersion = channel.currentVersionFullName !== '';
        const sortedChannelVersions = channel.versions.slice(0).sort(this.sortVersions(sorting));

        const updateGraph = expanded ? this.buildUpdateGraph(versions, sortedChannelVersions) : [];

        return (
            <div key={channel.name} className="oh-package-channels-editor__channel">
                <div className="oh-package-channels-editor__channel__header">
                    <div className="oh-package-channels-editor__channel__header__title">
                        <h3>
                            <span className="oh-package-channels-editor__channel__header__name" onClick={this.toggleExpand}>
                                <ChannelEditorChannelIcon expanded={expanded} />{channel.name}
                            </span>
                            {channel.isDefault &&
                                <span className="oh-package-channels-editor__channel__header__default">(default)</span>
                            }
                        </h3>
                    </div>
                    <div className="oh-package-channels-editor__channel__header__current-csv">
                        <div className="oh-tiny">CURRENT CSV</div>
                        <div className="oh-package-channels-editor__channel__header__current-csv__text">{channel.currentVersionFullName}</div>
                    </div>
                    <div className="oh-package-channels-editor__channel__header__validation">
                        {!versionsInChannelAreValid && <UploaderStatusIcon text="Invalid Entry" status={IconStatus.ERROR} />}
                        {!hasDefaultVersion && <UploaderStatusIcon text="No default version" status={IconStatus.ERROR} />}
                    </div>
                    <div className="oh-package-channels-editor__channel__header__menu">
                        <DropdownKebab id={`"editChannel_${channel.name}`} pullRight>
                            <MenuItem onClick={this.editChannelName}>Edit Channel Name</MenuItem>
                            <MenuItem onClick={this.setChannelAsDefault}>Set as the Default Channel</MenuItem>
                            <MenuItem onClick={this.deleteChannel}>Delete Channel</MenuItem>
                        </DropdownKebab>
                    </div>
                </div>
                {
                    expanded && (
                        <div className="oh-package-channels-editor__channel__content">
                            <div className="oh-package-channels-editor__channel__content__title">
                                <h3>Operator Versions</h3>
                                <a className="oh-package-channels-editor__add-link" href="#" onClick={this.addOperatorVersion}>
                                    <Icon type="fa" name="plus-circle" />
                                    <span>Add Operator Version</span>
                                </a>
                            </div>
                            {sortedChannelVersions.length > 0 && (
                                <div className="oh-package-channels-editor__channel__content__versions">
                                    <Grid fluid className="oh-operator-editor-upload__uploads">
                                        <Grid.Row className="oh-operator-editor-upload__uploads__row">
                                            <Grid.Col xs={3}>
                                                <span onClick={this.toggleSorting}>
                                                    <span className="oh-tiny">Version</span>
                                                    <span>
                                                        <PackageUploaderSortIcon direction={sorting} />
                                                    </span>
                                                </span>
                                            </Grid.Col>
                                            <Grid.Col xs={6}><span className="oh-tiny">Upgrade Path</span></Grid.Col>
                                            <Grid.Col xs={2}></Grid.Col>
                                            <Grid.Col xs={1} className="oh-operator-editor-upload__uploads__actions-col"></Grid.Col>
                                        </Grid.Row>
                                        {
                                            sortedChannelVersions.map(version => {
                                                const versionMetadata = versions.find(versionMeta => versionMeta.version === version);
                                                const isValid = versionMetadata && versionMetadata.valid;
                                                const versionEditorPath = `/packages/${encodeURIComponent(packageName)}/${encodeURIComponent(channel.name)}/${encodeURIComponent(version)}`;
                                                const curryWithVersion = <T extends Function>(fn: T) => (e: React.MouseEvent) => fn(e, version);

                                                return (
                                                    <Grid.Row key={version} className="oh-operator-editor-upload__uploads__row">
                                                        <Grid.Col xs={3}>
                                                            <h4>
                                                                <a href={versionEditorPath} onClick={e => this.goToVersionEditor(e, versionEditorPath, version)}>
                                                                    <span className="oh-package-channels-editor__channel__header__name">{version}</span>
                                                                    {version === channel.currentVersion &&
                                                                        <span className="oh-package-channels-editor__channel__header__default">(current)</span>
                                                                    }
                                                                </a>
                                                            </h4>
                                                        </Grid.Col>
                                                        <Grid.Col xs={6} className="oh-package-channels-editor__update-graph">
                                                            {
                                                                this.drawUpdatePaths(updateGraph, version)
                                                            }
                                                        </Grid.Col>
                                                        <Grid.Col xs={2}>
                                                            {!isValid && <UploaderStatusIcon text="Invalid Entry" status={IconStatus.ERROR} />}
                                                        </Grid.Col>
                                                        <Grid.Col xs={1} className="oh-operator-editor-upload__uploads__actions-col">
                                                            <DropdownKebab id={`editVersion_${version}`} pullRight>
                                                                <MenuItem onClick={curryWithVersion(this.duplicateVersion)}>Duplicate Operator Version</MenuItem>
                                                                <MenuItem>Edit Update Graph</MenuItem>
                                                                <MenuItem onClick={curryWithVersion(this.setVersionAsDefault)}>Set as Default Version</MenuItem>
                                                                <MenuItem onClick={curryWithVersion(this.editVersion)}>Edit Operator Version</MenuItem>
                                                                <MenuItem onClick={curryWithVersion(this.deleteVersion)}>Delete Operator Version</MenuItem>
                                                            </DropdownKebab>
                                                        </Grid.Col>
                                                    </Grid.Row>
                                                );
                                            })
                                        }
                                    </Grid>
                                </div>)
                            }
                        </div>
                    )
                }
            </div>
        )
    }
}


export default ChannelEditorChannel;