import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import connect from 'react-redux/es/connect/connect';
import { Alert, Breadcrumb, DropdownButton, EmptyState, Grid, MenuItem } from 'patternfly-react';
import { PropertiesSidePanel, PropertyItem } from 'patternfly-react-extensions';
import queryString from 'query-string';

import { helpers } from '../../common/helpers';
import { fetchOperator } from '../../services/operatorsService';
import { MarkdownView } from '../../components/MarkdownView';
import { ExternalLink } from '../../components/ExternalLink';
import Page from '../../components/Page';
import InstallModal from './InstallModal';
import * as operatorImg from '../../imgs/operator.svg';
import { reduxConstants } from '../../redux';
import * as maturityImgLevel1 from '../../imgs/maturity-imgs/level-1.svg';
import * as maturityImgLevel2 from '../../imgs/maturity-imgs/level-2.svg';
import * as maturityImgLevel3 from '../../imgs/maturity-imgs/level-3.svg';
import * as maturityImgLevel4 from '../../imgs/maturity-imgs/level-4.svg';
import * as maturityImgLevel5 from '../../imgs/maturity-imgs/level-5.svg';

const notAvailable = <span className="properties-side-panel-pf-property-label">N/A</span>;

const maturityImages = {
  'Basic Install': maturityImgLevel1,
  'Seamless Upgrades': maturityImgLevel2,
  'Full Lifecycle': maturityImgLevel3,
  'Deep Insights': maturityImgLevel4,
  'Auto Pilot': maturityImgLevel5
};

class OperatorPage extends React.Component {
  state = {
    operator: {},
    installShown: false
  };

  componentDidMount() {
    const { operator } = this.props;

    if (!_.isEmpty(operator)) {
      this.setCurrentOperatorVersion(operator);
    }
    this.refresh();
  }

  componentDidUpdate(prevProps) {
    const { operator } = this.props;

    if (operator && !_.isEqual(operator, prevProps.operator)) {
      this.setCurrentOperatorVersion(operator);
    }
  }

  refresh() {
    const searchObj = queryString.parse(this.props.location.search || this.props.urlSearchString);
    const operatorString = _.get(searchObj, 'name');

    if (!operatorString) {
      this.props.history.push('/');
      return;
    }

    const operatorId = JSON.parse(operatorString);
    this.props.fetchOperator(operatorId);
  }

  setCurrentOperatorVersion = operator => {
    const searchObj = queryString.parse(this.props.location.search || this.props.urlSearchString);
    const operatorString = _.get(searchObj, 'name');
    const name = JSON.parse(operatorString);

    const versionOperator = _.size(operator.versions) > 1 ? _.find(operator.versions, { name }) : operator;
    this.setState({ operator: versionOperator });
  };

  onHome = e => {
    e.preventDefault();
    this.props.history.push('/');
  };

  onViewMaturityModel = e => {
    e.preventDefault();
    this.props.history.push('/getting-started-with-operators#maturity-model-graphic');
  };

  searchCallback = searchValue => {
    if (searchValue) {
      this.props.storeKeywordSearch(searchValue);
      this.props.history.push(`/?keyword=${searchValue}`);
    }
  };

  updateVersion = operator => {
    this.setState({ operator });
    this.props.history.push(`/operator?name=${JSON.stringify(operator.name)}`);
  };

  showInstall = e => {
    e.preventDefault();
    this.setState({ installShown: true });
  };

  hideInstall = () => {
    this.setState({ installShown: false });
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

  renderMaturity = maturity => (
    <span>
      <span className="sr-only">{maturity}</span>
      <img className="oh-operator-page__side-panel__image" src={maturityImages[maturity]} alt={maturity} />
    </span>
  );

  renderSidePanel() {
    const { operator } = this.state;
    const {
      provider,
      maturity,
      links,
      version,
      versions,
      repository,
      containerImage,
      createdAt,
      maintainers,
      categories
    } = operator;

    const createdString = createdAt && `${createdAt}`;
    const containerImageLink = containerImage && <ExternalLink href={containerImage} text={containerImage} />;

    const maturityLabel = (
      <span>
        <span>Operator Maturity</span>
        <ExternalLink href="#" onClick={this.onViewMaturityModel}>Operator Maturity</ExternalLink>
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
          {this.renderPropertyItem(maturityLabel, this.renderMaturity(maturity))}
          {this.renderPropertyItem('Provider', provider)}
          {this.renderPropertyItem('Links', this.renderLinks(links))}
          {this.renderPropertyItem('Repository', repository)}
          {this.renderPropertyItem('Container Image', containerImageLink)}
          {this.renderPropertyItem('Created At', createdString)}
          {this.renderPropertyItem('Maintainers', this.renderMaintainers(maintainers))}
          {this.renderPropertyItem('Categories', categories)}
        </PropertiesSidePanel>
      </div>
    );
  }

  renderView() {
    const { error, pending } = this.props;
    const { operator } = this.state;
    const { displayName, longDescription } = operator;

    if (error) {
      return this.renderError();
    }

    if (pending || !operator) {
      return this.renderPendingMessage();
    }

    return (
      <div className="oh-operator-page row">
        <Grid.Col xs={12} sm={4} smPush={8} md={3} mdPush={9}>
          {this.renderSidePanel()}
        </Grid.Col>
        <Grid.Col xs={12} sm={8} smPull={4} md={9} mdPull={3}>
          <h1>{displayName}</h1>
          {longDescription && <MarkdownView content={longDescription} outerScroll />}
        </Grid.Col>
      </div>
    );
  }

  render() {
    const { operator, installShown } = this.state;

    const headerContent = (
      <div className="oh-operator-header__content">
        <div className="oh-operator-header__image-container">
          <img className="oh-operator-header__image" src={operator.imgUrl || operatorImg} alt="" />
        </div>
        <div className="oh-operator-header__info">
          <h1 className="oh-operator-header__title oh-hero">{operator.displayName}</h1>
          <div className="oh-operator-header__description">{operator.description}</div>
        </div>
      </div>
    );

    const toolbarContent = (
      <Breadcrumb>
        <Breadcrumb.Item onClick={e => this.onHome(e)} href={window.location.origin}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{operator.displayName}</Breadcrumb.Item>
      </Breadcrumb>
    );

    return (
      <Page
        className="oh-page-operator"
        headerContent={headerContent}
        toolbarContent={toolbarContent}
        history={this.props.history}
        searchCallback={this.searchCallback}
        headerRef={this.setHeaderRef}
        topBarRef={this.setTopBarRef}
      >
        {this.renderView()}
        <InstallModal show={installShown} operator={operator} onClose={this.hideInstall} />
      </Page>
    );
  }
}

OperatorPage.propTypes = {
  operator: PropTypes.object,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  pending: PropTypes.bool,
  urlSearchString: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  location: PropTypes.object.isRequired,
  fetchOperator: PropTypes.func,
  storeKeywordSearch: PropTypes.func
};

OperatorPage.defaultProps = {
  operator: {},
  error: false,
  errorMessage: '',
  pending: false,
  urlSearchString: '',
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
  ...state.operatorsState,
  urlSearchString: state.viewState.urlSearchString
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorPage);
