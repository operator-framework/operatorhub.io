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

const OperatorSidePanel = ({ operator, showInstall, updateVersion }) => {
  if (!operator) {
    return null;
  }

  const {
    provider,
    capabilityLevel,
    links,
    version,
    versions,
    repository,
    containerImage,
    createdAt,
    maintainers,
    categories
  } = operator;

  const renderPropertyItem = (label, value) =>
    value ? <PropertyItem label={label} value={value} /> : <PropertyItem label={label} value={notAvailable} />;

  const renderVersion = () =>
    _.size(versions) > 1 ? (
      <DropdownButton className="oh-operator-page__side-panel__version-dropdown" title={version} id="version-dropdown">
        {_.map(versions, (nextVersion, index) => (
          <MenuItem key={nextVersion.version} eventKey={index} onClick={() => updateVersion(nextVersion)}>
            {nextVersion.version}
          </MenuItem>
        ))}
      </DropdownButton>
    ) : (
      version
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
      <button className="oh-button oh-button-primary" disabled={!showInstall} onClick={showInstall}>
        Install
      </button>
      <div className="oh-operator-page__side-panel__separator" />
      <PropertiesSidePanel>
        {renderPropertyItem('Operator Version', renderVersion())}
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
  updateVersion: PropTypes.func
};

OperatorSidePanel.defaultProps = {
  operator: null,
  showInstall: null,
  updateVersion: helpers.noop
};

export default OperatorSidePanel;
