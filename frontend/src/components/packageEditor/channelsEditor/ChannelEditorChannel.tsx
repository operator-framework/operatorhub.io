import React from 'react';
import { DropdownKebab, MenuItem, Grid, Icon } from 'patternfly-react';

import ChannelEditorChannelIcon from './ChannelEditorChannelIcon';
import PackageUploaderSortIcon from '../../uploader/package/PackageUploaderSortIcon';
import { PacakgeEditorChannel, PackageEditorOperatorVersionMetadata } from '../../../utils/packageEditorTypes';



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
        const { channel,addOperatorVersion } = this.props;
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

    render() {
        const { packageName, channel } = this.props;
        const { expanded, sorting } = this.state;


        return (
            <div key={channel.name} className="oh-package-channels-editor__channel">
                <div className="oh-package-channels-editor__channel__header">
                    <div className="oh-package-channels-editor__channel__header__title">
                        <h3>
                            <span onClick={this.toggleExpand}>
                                <ChannelEditorChannelIcon expanded={expanded} />
                            </span>
                            {channel.name}
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
                        Invalid Entries
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
                            {channel.versions.length > 0 && (
                                <div className="oh-package-channels-editor__channel__content__versions">
                                    <Grid fluid className="oh-operator-editor-upload__uploads">
                                        <Grid.Row className="oh-operator-editor-upload__uploads__row">
                                            <Grid.Col xs={3}>
                                                <span className="oh-tiny">Version</span>
                                                <span onClick={this.toggleSorting}>
                                                    <PackageUploaderSortIcon direction={sorting} />
                                                </span>
                                            </Grid.Col>
                                            <Grid.Col xs={6}><span className="oh-tiny">Upgrade Path</span></Grid.Col>
                                            <Grid.Col xs={2}></Grid.Col>
                                            <Grid.Col xs={1} className="oh-operator-editor-upload__uploads__actions-col"></Grid.Col>
                                        </Grid.Row>
                                        {channel.versions
                                            .sort(this.sortVersions(sorting))
                                            .map(version => {
                                                const versionEditorPath = `/packages/${encodeURIComponent(packageName)}/${encodeURIComponent(channel.name)}/${encodeURIComponent(version)}`;
                                                const curryWithVersion = <T extends Function>(fn: T) => (e: React.MouseEvent) => fn(e, version);

                                                return (
                                                    <Grid.Row key={version} className="oh-operator-editor-upload__uploads__row">
                                                        <Grid.Col xs={3}>
                                                            <h4>
                                                                <a href={versionEditorPath} onClick={e => this.goToVersionEditor(e, versionEditorPath, version)}>
                                                                    {version}
                                                                    {version === channel.currentVersion &&
                                                                        <span className="oh-package-channels-editor__channel__header__default">(current)</span>
                                                                    }
                                                                </a>
                                                            </h4>
                                                        </Grid.Col>
                                                        <Grid.Col xs={6}></Grid.Col>
                                                        <Grid.Col xs={2}>Invalid Entry</Grid.Col>
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