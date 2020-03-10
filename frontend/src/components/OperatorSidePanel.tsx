import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import dateFormat from 'dateformat';
import copy from 'copy-to-clipboard';
import { Tooltip } from 'react-lightweight-tooltip';
import { DropdownButton, Icon, MenuItem, OverlayTrigger, Popover } from 'patternfly-react';
import { PropertiesSidePanel, PropertyItem } from 'patternfly-react-extensions';
import { ExternalLink } from './ExternalLink';
import { capabilityLevelModelDiagram } from '../utils/documentationLinks';
import { noop } from '../common/helpers';
// @ts-ignore
import * as capabilityLevelImgLevel1 from '../imgs/capability-level-imgs/level-1.svg';
// @ts-ignore
import * as capabilityLevelImgLevel2 from '../imgs/capability-level-imgs/level-2.svg';
// @ts-ignore
import * as capabilityLevelImgLevel3 from '../imgs/capability-level-imgs/level-3.svg';
// @ts-ignore
import * as capabilityLevelImgLevel4 from '../imgs/capability-level-imgs/level-4.svg';
// @ts-ignore
import * as capabilityLevelImgLevel5 from '../imgs/capability-level-imgs/level-5.svg';
// @ts-ignore
import * as capabilityLevelDiagram from '../imgs/capability-level-diagram.svg';
import { NormalizedOperatorPreview, NormalizedOperatorChannel, NormalizedVersion, OperatorLink, OperatorMaintainer } from '../utils/operatorTypes';

const notAvailable = <span className="properties-side-panel-pf-property-label">N/A</span>;

const capabilityLevelImages = {
  'Basic Install': capabilityLevelImgLevel1,
  'Seamless Upgrades': capabilityLevelImgLevel2,
  'Full Lifecycle': capabilityLevelImgLevel3,
  'Deep Insights': capabilityLevelImgLevel4,
  'Auto Pilot': capabilityLevelImgLevel5
};

export interface OperatorSidePanelProps {
  operator: NormalizedOperatorPreview
  showInstall?: (e: React.MouseEvent) => void
  updateChannel?: (channel: NormalizedOperatorChannel) => void
  updateVersion?: (version: NormalizedVersion) => void
}

interface OperatorSidePanelState {
  copied: boolean
}

class OperatorSidePanel extends React.PureComponent<OperatorSidePanelProps, OperatorSidePanelState> {

  static propTypes;
  static defaultProps;

  state: OperatorSidePanelState = {
    copied: false
  };

  copyToClipboard = (e: React.MouseEvent, command: string) => {
    e.preventDefault();

    copy(command);
    this.setState({ copied: true });
  };

  onCopyEnter = () => {
    this.setState({ copied: false });
  };

  getVersionString = (ver: string, currentVersion?: NormalizedVersion) => `${ver}${ver === _.get(currentVersion, 'version') ? ' (Current)' : ''}`;

  renderPropertyItem = (label: string | React.ReactElement, value: ReactNode) =>
    value ? <PropertyItem label={label} value={value} /> : <PropertyItem label={label} value={notAvailable} />;

  renderChannel = (channels: NormalizedOperatorChannel[], channel: string) => {
    const {updateChannel} = this.props;

    if (_.size(channels) > 1) {
      return (
        <DropdownButton className="oh-operator-page__side-panel__version-dropdown" title={channel} id="channel-dropdown">
          {_.map(channels, (nextChannel, index) => (
            <MenuItem key={nextChannel.name} eventKey={index} onClick={() => updateChannel && updateChannel(nextChannel)}>
              {nextChannel.name}
            </MenuItem>
          ))}
        </DropdownButton>
      )
    }

    return channel;
  }

  renderVersion = (versions: NormalizedVersion[], version: string, currentVersion?: NormalizedVersion) => {
    const {updateVersion} = this.props;
    const versionString = this.getVersionString(version, currentVersion);

    if(_.size(versions) > 1){
      return (
        <DropdownButton
          className="oh-operator-page__side-panel__version-dropdown"
          title={versionString}
          id="version-dropdown"
        >
          {_.map(versions, (nextVersion, index) => (
            <MenuItem key={nextVersion.version} eventKey={index} onClick={() => updateVersion && updateVersion(nextVersion)}>
              {this.getVersionString(nextVersion.version, currentVersion)}
            </MenuItem>
          ))}
        </DropdownButton>
      )
    }

    return versionString;
  };

  renderPackageFormat = (format: string) => {
    const formatLabelMap = {
      OLM: 'Operator Lifecycle Manager (OLM)'
    };

    return <span className="oh-operator-page__side-panel__format">{formatLabelMap[format] || format}</span>
  };

  renderLinks = (links: OperatorLink[] = []) => {
    const validLinks = links.filter(link => link.url && link.name);

    if (validLinks.length > 0) {
      return (
        <React.Fragment>
          {_.map(links, link => (
            <ExternalLink key={link.name} block href={link.url} text={link.name} indicator />
          ))}
        </React.Fragment>
      );
    }

    return notAvailable;
  };

  renderMaintainers = (maintainers: OperatorMaintainer[] = []) =>
    maintainers.length > 0 && (
      <React.Fragment>
        {_.map(maintainers, maintainer => (
          <React.Fragment key={maintainer.name}>
            <div>{maintainer.name}</div>
            <a href={`mailto:${maintainer.email}`}>{maintainer.email}</a>
          </React.Fragment>
        ))}
      </React.Fragment>
    );

  renderCapabilityLevel = (capabilityLevel: string) => (
    <span>
      <span className="sr-only">{capabilityLevel}</span>
      <img
        className="oh-operator-page__side-panel__image"
        src={capabilityLevelImages[capabilityLevel]}
        alt={capabilityLevel}
      />
    </span>
  );

  renderCategories = (categories: string[] = []) => {
    if (categories.length === 0) {
      return <div>Other</div>;
    }

    return (
      <React.Fragment>
        {categories.map(category => (
          <div key={category}>{category}</div>
        ))}
      </React.Fragment>
    );
  };

  renderCreatedAt = (createdAt: string | Date) => {
    if (!createdAt) {
      return notAvailable;
    }

    const createdAtDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
    if (!Number.isNaN(createdAtDate.getTime())) {
      return dateFormat(createdAtDate, 'ddd mmm dd, yyyy');
    }

    return createdAt;
  };

  render() {
    const { operator, showInstall } = this.props;

    const {
      name,
      provider,
      capabilityLevel,
      managedBy,
      links,
      channel,
      channels,
      version,
      repository,
      containerImage,
      createdAt,
      maintainers,
      categories
    } = operator;

    const activeChannel = _.find(channels, { name: channel });
    const versions = _.get(activeChannel, 'versions', [{name ,version: version}]);
    const currentVersion = _.find(versions, { name: _.get(activeChannel, 'currentCSV') });
    const allowInstall = name === _.get(currentVersion, 'name');
    const repoLink = repository ? <ExternalLink href={repository} text={repository} indicator/> : notAvailable;
    const tooltipText = this.state.copied ? 'Copied' : 'Copy to Clipboard';
    const tooltipContent = [
      <span className="oh-nowrap" key="nowrap">
        {tooltipText}
      </span>
    ];
    const tooltipOverrides = Object.freeze({
      wrapper: {
        cursor: 'pointer',
        top: '2px'
      },
      tooltip: {
        maxWidth: '170px',
        minWidth: 'auto'
      }
    });

    const imageLink = containerImage ? (
      <span>
        {containerImage}
        <Tooltip content={tooltipContent} styles={tooltipOverrides as any}>
          <a
            href="#"
            className="oh-image-link"
            onClick={e => this.copyToClipboard(e, containerImage)}
            onMouseEnter={this.onCopyEnter}
          >
            <Icon type="fa" name="clipboard" />
            <span className="sr-only">Copy</span>
          </a>
        </Tooltip>
      </span>
    ) : (
        notAvailable
      );

    const capabilityLevelLabel = (
      <span>
        <span>Capability Level</span>
        <OverlayTrigger
          overlay={
            <Popover id="capability-level-help" className="oh-capability-level-popover">
              <img className="oh-capability-level-popover__img" src={capabilityLevelDiagram} alt="" />
            </Popover>
          }
          placement="left"
          positionLeft={700}
          trigger={['click']}
          rootClose
        >
          <Icon className="oh-capability-level-popover__icon" type="pf" name="help" />
        </OverlayTrigger>
        <ExternalLink className="oh-capability-level-popover__link" href={capabilityLevelModelDiagram} text="" indicator />
      </span>
    );

    return (
      <div className="oh-operator-page__side-panel">
        {showInstall && !allowInstall ? (
          <OverlayTrigger
            overlay={
              <Popover id="old-version-help">
                <span>Only the current version can be installed</span>
              </Popover>
            }
            placement="top"
          >
            <button className="oh-button oh-button-primary oh-disabled">Install</button>
          </OverlayTrigger>
        ) : (
            <button className="oh-button oh-button-primary" disabled={!showInstall} onClick={showInstall}>
              Install
          </button>
          )}
        <div className="oh-operator-page__side-panel__separator" />
        <PropertiesSidePanel>
          {this.renderPropertyItem('Channel', this.renderChannel(channels, channel || ''))}
          {this.renderPropertyItem('Version', this.renderVersion(versions, version, currentVersion))}
          {this.renderPropertyItem(capabilityLevelLabel, this.renderCapabilityLevel(capabilityLevel))}
          {this.renderPropertyItem('Provider', provider)}
          {this.renderPropertyItem('Package Format', this.renderPackageFormat(managedBy || ''))}
          {this.renderPropertyItem('Links', this.renderLinks(links))}
          {this.renderPropertyItem('Repository', repoLink)}
          {this.renderPropertyItem('Container Image', imageLink)}
          {this.renderPropertyItem('Created At', this.renderCreatedAt(createdAt))}
          {this.renderPropertyItem('Maintainers', this.renderMaintainers(maintainers))}
          {this.renderPropertyItem('Categories', this.renderCategories(categories))}
        </PropertiesSidePanel>
      </div>
    );
  }
}

OperatorSidePanel.propTypes = {
  operator: PropTypes.any.isRequired,
  showInstall: PropTypes.func,
  updateChannel: PropTypes.func,
  updateVersion: PropTypes.func
};

OperatorSidePanel.defaultProps = {
  showInstall: null,
  updateChannel: noop,
  updateVersion: noop
};

export default OperatorSidePanel;
