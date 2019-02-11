import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import connect from 'react-redux/es/connect/connect';
import { Alert, Breadcrumb, DropdownButton, EmptyState, Grid, MenuItem } from 'patternfly-react';
import { PropertiesSidePanel, PropertyItem } from 'patternfly-react-extensions';

import { helpers } from '../../common/helpers';
import { fetchOperator } from '../../services/operatorsService';
import { MarkdownView } from '../../components/MarkdownView';
import { ExternalLink } from '../../components/ExternalLink';
import Page from '../../components/Page';
import * as operatorImg from '../../imgs/operator.svg';
import { reduxConstants } from '../../redux';

const notAvailable = <span className="properties-side-panel-pf-property-label">N/A</span>;

class OperatorPage extends React.Component {
  state = {
    operator: {}
  };

  componentDidMount() {
    this.setState({ operator: this.props.operator });
    this.refresh();
  }

  componentDidUpdate(prevProps) {
    const { operator } = this.props;

    if (operator && !_.isEqual(operator, prevProps.operator)) {
      let stateOperator = operator;
      if (this.state.operator) {
        stateOperator = _.find(operator.version, { version: this.state.operator.version }) || operator;
      }
      this.setState({ operator: stateOperator });
    }
  }

  refresh() {
    const { match } = this.props;
    this.props.fetchOperator(_.get(match, 'params.operatorId'));
  }

  onHome = e => {
    e.preventDefault();
    this.props.history.push('/');
  };

  searchCallback = searchValue => {
    if (searchValue) {
      this.props.storeKeywordSearch(searchValue);
      this.props.history.push(`/?keyword=${searchValue}`);
    }
  };

  updateVersion = operator => {
    this.setState({ operator });
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

  renderDetails() {
    const { error, pending } = this.props;
    const { operator } = this.state;

    if (error) {
      return this.renderError();
    }

    if (pending || !operator) {
      return this.renderPendingMessage();
    }

    const {
      displayName,
      provider,
      maturity,
      longDescription,
      links,
      version,
      versions,
      repository,
      containerImage,
      createdAt,
      maintainers,
      categories
    } = operator;

    const versionComponent =
      _.size(versions) > 1 ? (
        <DropdownButton
          className="oh-operator-page__side-panel__version-dropdown"
          title={version}
          id="version-dropdown"
        >
          {_.map(versions, (nextVersion, index) => (
            <MenuItem key={nextVersion.version} eventKey={index} onClick={() => this.updateVersion(nextVersion)}>
              {nextVersion.version}
            </MenuItem>
          ))}
        </DropdownButton>
      ) : (
        version
      );

    const linksComponent = _.size(links) && (
      <React.Fragment>
        {_.map(links, link => (
          <ExternalLink key={link.name} href={link.url} text={link.name} />
        ))}
      </React.Fragment>
    );

    const maintainersComponent = _.size(maintainers) && (
      <React.Fragment>
        {_.map(maintainers, maintainer => (
          <React.Fragment key={maintainer.name}>
            <div>{maintainer.name}</div>
            <a href={`mailto:${maintainer.email}`}>{maintainer.email}</a>
          </React.Fragment>
        ))}
      </React.Fragment>
    );

    const createdString = createdAt && `${createdAt}`;

    const containerImageLink = containerImage && <ExternalLink href={containerImage} text={containerImage} />;

    return (
      <div className="oh-operator-page">
        <div className="oh-operator-page__content row">
          <Grid.Col xs={12} sm={4} smPush={8} md={3} mdPush={9} className="oh-operator-page__side-panel">
            <a
              className="oh-operator-page__side-panel__button oh-operator-page__side-panel__button-primary"
              href="https://github.com/operator-framework/operator-lifecycle-manager#getting-started"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started
            </a>
            <div className="oh-operator-page__side-panel__separator" />
            <PropertiesSidePanel>
              {this.renderPropertyItem('Operator Version', versionComponent)}
              {this.renderPropertyItem('Operator Maturity', maturity)}
              {this.renderPropertyItem('Provider', provider)}
              {this.renderPropertyItem('Links', linksComponent)}
              {this.renderPropertyItem('Repository', repository)}
              {this.renderPropertyItem('Container Image', containerImageLink)}
              {this.renderPropertyItem('Created At', createdString)}
              {this.renderPropertyItem('Maintainers', maintainersComponent)}
              {this.renderPropertyItem('Categories', categories)}
            </PropertiesSidePanel>
          </Grid.Col>
          <Grid.Col xs={12} sm={8} smPull={4} md={9} mdPull={3}>
            <h1>{displayName}</h1>
            {longDescription && <MarkdownView content={longDescription} outerScroll />}
          </Grid.Col>
        </div>
      </div>
    );
  }

  render() {
    const { operator } = this.state;

    const headerContent = (
      <React.Fragment>
        <div className="oh-header__content__image-container">
          <img className="oh-header__content__image" src={operator.imgUrl || operatorImg} alt="" />
        </div>
        <div className="oh-header__content__info">
          <h1 className="oh-header__content__title oh-hero">{operator.displayName}</h1>
          <div className="oh-header__content__description">{operator.description}</div>
        </div>
      </React.Fragment>
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
        pageClasses="oh-page-operator"
        headerContent={headerContent}
        toolbarContent={toolbarContent}
        history={this.props.history}
        searchCallback={this.searchCallback}
        headerRef={this.setHeaderRef}
        topBarRef={this.setTopBarRef}
      >
        {this.renderDetails()}
      </Page>
    );
  }
}

OperatorPage.propTypes = {
  operator: PropTypes.object,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  pending: PropTypes.bool,
  match: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  fetchOperator: PropTypes.func,
  storeKeywordSearch: PropTypes.func
};

OperatorPage.defaultProps = {
  operator: {},
  error: false,
  errorMessage: '',
  pending: false,
  match: {},
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
