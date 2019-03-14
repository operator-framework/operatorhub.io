import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import connect from 'react-redux/es/connect/connect';
import {
  Alert,
  Breadcrumb,
  DropdownButton,
  EmptyState,
  Grid,
  Icon,
  MenuItem,
  OverlayTrigger,
  Popover
} from 'patternfly-react';
import { PropertiesSidePanel, PropertyItem } from 'patternfly-react-extensions';

import { helpers } from '../../common/helpers';
import { fetchOperator } from '../../services/operatorsService';
import { MarkdownView } from '../../components/MarkdownView';
import { ExternalLink } from '../../components/ExternalLink';
import { capabilityLevelModelDiagram } from '../../utils/documentationLinks';
import Page from '../../components/Page';
import InstallModal from './InstallModal';
import ExampleYamlModal from './ExampleYamlModal';
import * as operatorImg from '../../imgs/operator.svg';
import { reduxConstants } from '../../redux';
import * as capabilityLevelImgLevel1 from '../../imgs/capability-level-imgs/level-1.svg';
import * as capabilityLevelImgLevel2 from '../../imgs/capability-level-imgs/level-2.svg';
import * as capabilityLevelImgLevel3 from '../../imgs/capability-level-imgs/level-3.svg';
import * as capabilityLevelImgLevel4 from '../../imgs/capability-level-imgs/level-4.svg';
import * as capabilityLevelImgLevel5 from '../../imgs/capability-level-imgs/level-5.svg';
import * as capabilityLevelDiagram from '../../imgs/capability-level-diagram.svg';

const notAvailable = <span className="properties-side-panel-pf-property-label">N/A</span>;

const capabilityLevelImages = {
  'Basic Install': capabilityLevelImgLevel1,
  'Seamless Upgrades': capabilityLevelImgLevel2,
  'Full Lifecycle': capabilityLevelImgLevel3,
  'Deep Insights': capabilityLevelImgLevel4,
  'Auto Pilot': capabilityLevelImgLevel5
};

class OperatorPage extends React.Component {
  state = {
    operator: {},
    installShown: false,
    refreshed: false,
    keywordSearch: '',
    exampleYamlShown: false
  };

  componentDidMount() {
    const { operator } = this.props;

    if (!_.isEmpty(operator)) {
      this.setCurrentOperatorVersion(operator);
    }
    this.refresh();
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.refreshed && props.pending) {
      return { refreshed: true };
    }
    return null;
  }

  componentDidUpdate(prevProps) {
    const { operator } = this.props;

    if (operator && !_.isEqual(operator, prevProps.operator)) {
      this.setCurrentOperatorVersion(operator);
    }
  }

  refresh() {
    const operatorName = _.get(this.props.match, 'params.operatorId');

    this.props.fetchOperator(operatorName);
  }

  setCurrentOperatorVersion = operator => {
    const name = _.get(this.props.match, 'params.operatorId');

    const versionOperator = _.size(operator.versions) > 1 ? _.find(operator.versions, { name }) : operator;
    this.setState({ operator: versionOperator });
  };

  onHome = e => {
    e.preventDefault();
    this.props.history.push('/');
  };

  onSearchChange = searchValue => {
    this.setState({ keywordSearch: searchValue });
  };

  clearSearch = () => {
    this.onSearchChange('');
  };

  searchCallback = searchValue => {
    if (searchValue) {
      this.props.storeKeywordSearch(searchValue);
      this.props.history.push(`/?keyword=${searchValue}`);
    }
  };

  updateVersion = operator => {
    this.setState({ operator });
    this.props.history.push(`/operator/${operator.name}`);
  };

  showInstall = e => {
    e.preventDefault();
    this.setState({ installShown: true });
  };

  hideInstall = () => {
    this.setState({ installShown: false });
  };

  showExampleYaml = (e, crd) => {
    e.preventDefault();
    this.setState({ exampleYamlShown: true, crdExample: crd });
  };

  hideExampleYaml = () => {
    this.setState({ exampleYamlShown: false });
  };

  renderPendingMessage = () => (
    <EmptyState className="blank-slate-content-pf">
      <div className="loading-state-pf loading-state-pf-lg">
        <div className="spinner spinner-lg" />
        Loading operator
      </div>
    </EmptyState>
  );

  renderError = () => {
    const { errorMessage } = this.props;

    return (
      <EmptyState className="blank-slate-content-pf">
        <Alert type="error">
          <span>Error retrieving operators: {errorMessage}</span>
        </Alert>
      </EmptyState>
    );
  };

  renderPropertyItem = (label, value) =>
    value ? <PropertyItem label={label} value={value} /> : <PropertyItem label={label} value={notAvailable} />;

  renderVersion = (version, versions) =>
    _.size(versions) > 1 ? (
      <DropdownButton className="oh-operator-page__side-panel__version-dropdown" title={version} id="version-dropdown">
        {_.map(versions, (nextVersion, index) => (
          <MenuItem key={nextVersion.version} eventKey={index} onClick={() => this.updateVersion(nextVersion)}>
            {nextVersion.version}
          </MenuItem>
        ))}
      </DropdownButton>
    ) : (
      version
    );

  renderLinks = links =>
    _.size(links) && (
      <React.Fragment>
        {_.map(links, link => (
          <ExternalLink key={link.name} block href={link.url} text={link.name} />
        ))}
      </React.Fragment>
    );

  renderMaintainers = maintainers =>
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

  renderCapabilityLevel = capabilityLevel => (
    <span>
      <span className="sr-only">{capabilityLevel}</span>
      <img
        className="oh-operator-page__side-panel__image"
        src={capabilityLevelImages[capabilityLevel]}
        alt={capabilityLevel}
      />
    </span>
  );

  renderCategories = categories => {
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

  renderSidePanel() {
    const { operator } = this.state;
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

    return (
      <div className="oh-operator-page__side-panel">
        <a
          className="oh-operator-page__side-panel__button oh-operator-page__side-panel__button-primary"
          href="#"
          onClick={this.showInstall}
        >
          Install
        </a>
        <div className="oh-operator-page__side-panel__separator" />
        <PropertiesSidePanel>
          {this.renderPropertyItem('Operator Version', this.renderVersion(version, versions))}
          {this.renderPropertyItem(capabilityLevelLabel, this.renderCapabilityLevel(capabilityLevel))}
          {this.renderPropertyItem('Provider', provider)}
          {this.renderPropertyItem('Links', this.renderLinks(links))}
          {this.renderPropertyItem('Repository', repoLink)}
          {this.renderPropertyItem('Container Image', imageLink)}
          {this.renderPropertyItem('Created At', createdAt)}
          {this.renderPropertyItem('Maintainers', this.renderMaintainers(maintainers))}
          {this.renderPropertyItem('Categories', this.renderCategories(categories))}
        </PropertiesSidePanel>
      </div>
    );
  }

  renderCustomResourceDefinitions() {
    const { operator } = this.state;

    if (!operator) {
      return null;
    }

    const { customResourceDefinitions } = operator;

    if (!_.size(customResourceDefinitions)) {
      return null;
    }

    const showExamples = _.some(customResourceDefinitions, crd => crd.yamlExample);

    return (
      <React.Fragment>
        <h3>Custom Resource Definitions</h3>
        <div className="oh-crd-tile-view">
          {_.map(customResourceDefinitions, crd => (
            <div className="oh-crd-tile" key={crd.name}>
              <div className="oh-crd-tile__title">{crd.displayName}</div>
              <div className="oh-crd-tile__rule" />
              <div className="oh-crd-tile__description">{crd.description}</div>
              {showExamples && (
                <a
                  className={`oh-crd-tile__link ${crd.yamlExample ? '' : 'oh-not-visible'}`}
                  href="#"
                  onClick={e => this.showExampleYaml(e, crd)}
                >
                  <span>View YAML Example</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }

  renderView() {
    const { error, pending } = this.props;
    const { operator } = this.state;

    if (error) {
      return this.renderError();
    }

    if (pending || !operator) {
      return this.renderPendingMessage();
    }

    const { displayName, longDescription } = operator;

    return (
      <div className="oh-operator-page row">
        <Grid.Col xs={12} sm={4} smPush={8} md={3} mdPush={9}>
          {this.renderSidePanel()}
        </Grid.Col>
        <Grid.Col xs={12} sm={8} smPull={4} md={9} mdPull={3}>
          <h1>{displayName}</h1>
          {longDescription && <MarkdownView>{longDescription}</MarkdownView>}
          {this.renderCustomResourceDefinitions()}
        </Grid.Col>
      </div>
    );
  }

  render() {
    const { operator, installShown, exampleYamlShown, crdExample, refreshed, keywordSearch } = this.state;
    const { pending } = this.props;

    const headerContent = (
      <div className="oh-operator-header__content">
        <div className="oh-operator-header__image-container">
          <img className="oh-operator-header__image" src={_.get(operator, 'imgUrl') || operatorImg} alt="" />
        </div>
        <div className="oh-operator-header__info">
          <h1 className="oh-operator-header__title oh-hero">{_.get(operator, 'displayName')}</h1>
          <div className="oh-operator-header__description">{_.get(operator, 'description')}</div>
        </div>
      </div>
    );

    const toolbarContent = (
      <Breadcrumb>
        <Breadcrumb.Item onClick={e => this.onHome(e)} href={window.location.origin}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{_.get(operator, 'displayName')}</Breadcrumb.Item>
      </Breadcrumb>
    );

    return (
      <Page
        className="oh-page-operator"
        headerContent={headerContent}
        toolbarContent={toolbarContent}
        history={this.props.history}
        searchValue={keywordSearch}
        onSearchChange={this.onSearchChange}
        clearSearch={this.clearSearch}
        searchCallback={this.searchCallback}
        headerRef={this.setHeaderRef}
        topBarRef={this.setTopBarRef}
        showFooter={refreshed && !pending}
      >
        {this.renderView()}
        <InstallModal show={installShown} operator={operator} onClose={this.hideInstall} history={this.props.history} />
        <ExampleYamlModal
          show={exampleYamlShown}
          customResourceDefinition={crdExample}
          onClose={this.hideExampleYaml}
        />
      </Page>
    );
  }
}

OperatorPage.propTypes = {
  operator: PropTypes.object,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  pending: PropTypes.bool,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired,
  fetchOperator: PropTypes.func,
  storeKeywordSearch: PropTypes.func
};

OperatorPage.defaultProps = {
  operator: {},
  error: false,
  errorMessage: '',
  pending: false,
  fetchOperator: helpers.noop,
  storeKeywordSearch: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  fetchOperator: name => dispatch(fetchOperator(name)),
  storeKeywordSearch: keywordSearch =>
    dispatch({
      type: reduxConstants.SET_KEYWORD_SEARCH,
      keywordSearch
    })
});

const mapStateToProps = state => ({
  ...state.operatorsState
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorPage);
