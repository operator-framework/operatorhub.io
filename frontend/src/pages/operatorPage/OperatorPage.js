import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import connect from 'react-redux/es/connect/connect';
import { Alert, Breadcrumb, EmptyState, Grid } from 'patternfly-react';

import { helpers } from '../../common/helpers';
import { fetchOperator } from '../../services/operatorsService';
import { MarkdownView } from '../../components/MarkdownView';
import Page from '../../components/Page';
import InstallModal from '../../components/InstallModal';
import ExampleYamlModal from '../../components/ExampleYamlModal';
import * as operatorImg from '../../imgs/operator.svg';
import { reduxConstants } from '../../redux';
import CustomResourceDefinitionsView from '../../components/CustomResourceDefinitionsView';
import OperatorSidePanel from '../../components/OperatorSidePanel';

class OperatorPage extends React.Component {
  state = {
    installShown: false,
    refreshed: false,
    keywordSearch: '',
    exampleYamlShown: false
  };

  componentDidMount() {
    this.refresh();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;

    if (!_.isEqual(match, prevProps.match)) {
      this.refresh();
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (!state.refreshed && props.pending) {
      return { refreshed: true };
    }
    return null;
  }

  refresh() {
    const channel = _.get(this.props.match, 'params.channel');
    const operatorName = _.get(this.props.match, 'params.operatorId');

    this.props.fetchOperator(operatorName, channel);
  }

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

  updateChannel = channel => {
    const { operator } = this.props;

    if (channel.name !== operator.channel) {
      this.props.history.push(`/operator/${channel.name}/${channel.currentCSV}`);
    }
  };

  updateVersion = version => {
    const { operator } = this.props;

    this.props.history.push(`/operator/${operator.channel}/${version.name}`);
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

  renderView() {
    const { operator, error, pending } = this.props;

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
          <OperatorSidePanel
            operator={operator}
            showInstall={this.showInstall}
            updateChannel={this.updateChannel}
            updateVersion={this.updateVersion}
          />
        </Grid.Col>
        <Grid.Col xs={12} sm={8} smPull={4} md={9} mdPull={3}>
          <h1>{displayName}</h1>
          {longDescription && <MarkdownView>{longDescription}</MarkdownView>}
          <CustomResourceDefinitionsView operator={operator} showExampleYaml={this.showExampleYaml} />
        </Grid.Col>
      </div>
    );
  }

  render() {
    const { installShown, exampleYamlShown, crdExample, refreshed, keywordSearch } = this.state;
    const { operator, pending } = this.props;

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
  fetchOperator: (name, channel) => dispatch(fetchOperator(name, channel)),
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
