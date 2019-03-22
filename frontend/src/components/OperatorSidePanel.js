import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import dateFormat from 'dateformat';
import { DropdownButton, Icon, MenuItem, OverlayTrigger, Popover } from 'patternfly-react';
import { PropertiesSidePanel, PropertyItem } from 'patternfly-react-extensions';
import { ExternalLink } from './ExternalLink';
import { capabilityLevelModelDiagram } from '../utils/documentationLinks';
import { helpers } from '../common/helpers';
import * as capabilityLevelImgLevel1 from '../imgs/capability-level-imgs/level-1.svg';
import * as capabilityLevelImgLevel2 from '../imgs/capability-level-imgs/level-2.svg';
import * as capabilityLevelImgLevel3 from '../imgs/capability-level-imgs/level-3.svg';
import * as capabilityLevelImgLevel4 from '../imgs/capability-level-imgs/level-4.svg';
import * as capabilityLevelImgLevel5 from '../imgs/capability-level-imgs/level-5.svg';
import * as capabilityLevelDiagram from '../imgs/capability-level-diagram.svg';

const notAvailable = <span className="properties-side-panel-pf-property-label">N/A</span>;

const capabilityLevelImages = {
  'Basic Install': capabilityLevelImgLevel1,
  'Seamless Upgrades': capabilityLevelImgLevel2,
  'Full Lifecycle': capabilityLevelImgLevel3,
  'Deep Insights': capabilityLevelImgLevel4,
  'Auto Pilot': capabilityLevelImgLevel5
};

const OperatorSidePanel = ({ operator, showInstall, updateChannel, updateVersion }) => {
  if (!operator) {
    return null;
  }

  const {
    name,
    provider,
    capabilityLevel,
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
  const versions = _.get(activeChannel, 'versions', [version]);
  const currentVersion = _.find(versions, { name: _.get(activeChannel, 'currentCSV') });
  const allowInstall = name === _.get(currentVersion, 'name');

  const getVersionString = ver => `${ver}${ver === _.get(currentVersion, 'version') ? ' (Current)' : ''}`;

  const renderPropertyItem = (label, value) =>
    value ? <PropertyItem label={label} value={value} /> : <PropertyItem label={label} value={notAvailable} />;

  const renderChannel = () =>
    _.size(channels) > 1 ? (
      <DropdownButton className="oh-operator-page__side-panel__version-dropdown" title={channel} id="channel-dropdown">
        {_.map(channels, (nextChannel, index) => (
          <MenuItem key={nextChannel.name} eventKey={index} onClick={() => updateChannel(nextChannel)}>
            {nextChannel.name}
          </MenuItem>
        ))}
      </DropdownButton>
    ) : (
      channel
    );

  const renderVersion = () =>
    _.size(versions) > 1 ? (
      <DropdownButton
        className="oh-operator-page__side-panel__version-dropdown"
        title={getVersionString(version)}
        id="version-dropdown"
      >
        {_.map(versions, (nextVersion, index) => (
          <MenuItem key={nextVersion.version} eventKey={index} onClick={() => updateVersion(nextVersion)}>
            {getVersionString(nextVersion.version)}
          </MenuItem>
        ))}
      </DropdownButton>
    ) : (
      getVersionString(version)
    );

  const renderLinks = () =>
    _.size(links) && (
      <React.Fragment>
        {_.map(links, link => (
          <ExternalLink key={link.name} block href={link.url} text={link.name} />
        ))}
      </React.Fragment>
    );

  const renderMaintainers = () =>
    _.size(maintainers) && (
      <React.Fragment>
        {_.map(maintainers, maintainer => (
          <React.Fragment key={maintainer.name}>
            <div>{maintainer.name}</div>
            <a href={`mailto:${maintainer.email}`}>{maintainer.email}</a>
          </React.Fragment>
        ))}
      </React.Fragment>
    );

  const renderCapabilityLevel = () => (
    <span>
      <span className="sr-only">{capabilityLevel}</span>
      <img
        className="oh-operator-page__side-panel__image"
        src={capabilityLevelImages[capabilityLevel]}
        alt={capabilityLevel}
      />
    </span>
  );

  const renderCategories = () => {
    if (!_.size(categories)) {
      return <div>Other</div>;
    }

    return (
      <React.Fragment>
        {_.map(categories, category => (
          <div key={category}>{category}</div>
        ))}
      </React.Fragment>
    );
  };

  const imageLink = containerImage ? <ExternalLink href={containerImage} text={containerImage} /> : notAvailable;
  const repoLink = repository ? <ExternalLink href={repository} text={repository} /> : notAvailable;

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
      <ExternalLink className="oh-capability-level-popover__link" href={capabilityLevelModelDiagram} text="" />
    </span>
  );

  const renderCreatedAt = () => {
    if (!createdAt) {
      return notAvailable;
    }

    const createdAtDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
    if (!Number.isNaN(createdAtDate.getTime())) {
      return dateFormat(createdAtDate, 'ddd mmm dd, yyyy');
    }

    return createdAt;
  };

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
        {renderPropertyItem('Channel', renderChannel())}
        {renderPropertyItem('Version', renderVersion())}
        {renderPropertyItem(capabilityLevelLabel, renderCapabilityLevel())}
        {renderPropertyItem('Provider', provider)}
        {renderPropertyItem('Links', renderLinks())}
        {renderPropertyItem('Repository', repoLink)}
        {renderPropertyItem('Container Image', imageLink)}
        {renderPropertyItem('Created At', renderCreatedAt())}
        {renderPropertyItem('Maintainers', renderMaintainers())}
        {renderPropertyItem('Categories', renderCategories())}
      </PropertiesSidePanel>
    </div>
  );
};

OperatorSidePanel.propTypes = {
  operator: PropTypes.object,
  showInstall: PropTypes.func,
  updateChannel: PropTypes.func,
  updateVersion: PropTypes.func
};

OperatorSidePanel.defaultProps = {
  operator: null,
  showInstall: null,
  updateChannel: helpers.noop,
  updateVersion: helpers.noop
};

export default OperatorSidePanel;
