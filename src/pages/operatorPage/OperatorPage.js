import * as React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import connect from 'react-redux/es/connect/connect';
import { Alert, Breadcrumb, DropdownButton, EmptyState, Grid, MenuItem } from 'patternfly-react';
import { PropertiesSidePanel, PropertyItem } from 'patternfly-react-extensions';

import Footer from '../../components/Footer';
import { helpers } from '../../common/helpers';
import { fetchOperators } from '../../services/operatorsService';
import { MarkdownView } from '../../components/MarkdownView';
import { ExternalLink } from '../../components/ExternalLink';
import { OperatorHeader } from './OperatorHeader';

class OperatorPage extends React.Component {
  state = {
    operator: {},
    searchValue: ''
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
    this.props.fetchOperators(_.get(match, 'params.operatorId'));
  }

  onHome(e) {
    e.preventDefault();
    this.props.history.push('/');
  }

  onSearch = searchValue => {
    if (searchValue) {
      this.props.history.push(`/?search=${searchValue}`);
      return;
    }

    this.setState({ searchValue });
  };

  clearSearch = () => {
    this.onSearch('');
  };

  updateVersion = operator => {
    this.setState({ operator });
  };

  contentScrolled = scrollEvent => {
    const scroller = scrollEvent.currentTarget;
    this.setState({ scrollTop: scroller.scrollTop });
    this.setState({ fixedHeader: scroller.scrollTop > 110, scrollTop: scroller.scrollTop });
  };

  onHeaderWheel = wheelEvent => {
    this.scrollRef.scrollTop -= _.get(wheelEvent, 'nativeEvent.wheelDelta', 0);
  };

  setScrollRef = ref => {
    this.scrollRef = ref;
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
      name,
      provider,
      maturity,
      longDescription,
      links,
      version,
      versions,
      repository,
      containerImage,
      createdAt,
      maintainers
    } = operator;
    const notAvailable = <span className="properties-side-panel-pf-property-label">N/A</span>;

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
        <React.Fragment>{version}</React.Fragment>
      );

    const linksComponent = _.size(links) ? (
      <React.Fragment>
        {_.map(links, link => (
          <ExternalLink key={link.name} href={link.url} text={link.name} />
        ))}
      </React.Fragment>
    ) : (
      notAvailable
    );

    const maintainersComponent = _.size(maintainers) ? (
      <React.Fragment>
        {_.map(maintainers, maintainer => (
          <React.Fragment key={maintainer.name}>
            <div>{maintainer.name}</div>
            <a href={`mailto:${maintainer.email}`}>{maintainer.email}</a>
          </React.Fragment>
        ))}
      </React.Fragment>
    ) : (
      notAvailable
    );

    const createdString = createdAt && `${createdAt}`;

    return (
      <React.Fragment>
        <div className="oh-operator-page__toolbar">
          <Breadcrumb>
            <Breadcrumb.Item onClick={e => this.onHome(e)} href="#">
              Home
            </Breadcrumb.Item>
            <Breadcrumb.Item active>{name}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
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
                <PropertyItem label="Operator Version" value={versionComponent} />
                <PropertyItem label="Operator Maturity" value={maturity || notAvailable} />
                <PropertyItem label="Provider" value={provider || notAvailable} />
                <PropertyItem label="Links" value={linksComponent} />
                <PropertyItem label="Repository" value={repository || notAvailable} />
                <PropertyItem label="Container Image" value={containerImage || notAvailable} />
                <PropertyItem label="Created At" value={createdString || notAvailable} />
                <PropertyItem label="Maintainers" value={maintainersComponent} />
              </PropertiesSidePanel>
            </Grid.Col>
            <Grid.Col xs={12} sm={8} smPull={4} md={9} mdPull={3}>
              <h1>{name}</h1>
              {longDescription && <MarkdownView content={longDescription} outerScroll />}
            </Grid.Col>
          </div>
        </div>
      </React.Fragment>
    );
  }

  render() {
    const { operator } = this.props;
    const { fixedHeader, scrollTop, searchValue } = this.state;
    const headStyle = fixedHeader ? { top: scrollTop || 0 } : null;
    const pageClasses = classNames('oh-page', { 'oh-page-fixed-header': fixedHeader });
    return (
      <div className="content-scrollable" onScroll={this.contentScrolled} ref={this.setScrollRef}>
        <div className={pageClasses}>
          <div className="oh-page__spacer" />
          <div className="oh-page__content">
            <OperatorHeader
              operator={operator}
              style={headStyle}
              searchCallback={this.onSearch}
              clearSearch={this.clearSearch}
              searchValue={searchValue}
              onWheel={e => {
                this.onHeaderWheel(e);
              }}
            />
            <div className="oh-content oh-content-operator">{this.renderDetails()}</div>
            <Footer />
          </div>
          <div className="oh-page__spacer" />
        </div>
      </div>
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
  fetchOperators: PropTypes.func
};

OperatorPage.defaultProps = {
  operator: {},
  error: false,
  errorMessage: '',
  pending: false,
  match: {},
  fetchOperators: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  fetchOperators: name => dispatch(fetchOperators(name))
});

const mapStateToProps = state => ({
  ...state.operatorsState
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorPage);
