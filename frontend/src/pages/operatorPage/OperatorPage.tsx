import { History } from 'history';
import _ from 'lodash-es';
import { Breadcrumb, Grid } from 'patternfly-react';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { match } from 'react-router';

import { noop } from '../../common/helpers';
import CustomResourceDefinitionsView from '../../components/CustomResourceDefinitionsView';
import { MarkdownView } from '../../components/MarkdownView';
import ExampleYamlModal from '../../components/modals/ExampleYamlModal';
import InstallModal from '../../components/modals/InstallModal';
import OperatorSidePanel from '../../components/OperatorSidePanel';
import ErrorMessage from '../../components/other/ErrorMessage';
import Loader from '../../components/other/Loader';
import Page from '../../components/page/Page';
// @ts-ignore
import * as operatorImg from '../../imgs/operator.svg';
import { storeKeywordSearchAction, StoreState } from '../../redux';
import { fetchLatestOlmVersion, fetchOperator } from '../../services/operatorsService';
import { bindActionCreators } from 'redux';
import { OperatorsReducersState } from '../../redux/operatorsReducer';
import { NormalizedCrdPreview } from '../../utils/operatorTypes';

export type OperatorPageProps = {
  history: History
  match: match<{ packageName: string, channel: string, operatorId: string }>
  fetchOperator: typeof fetchOperator
  fetchOlmVersion: typeof fetchLatestOlmVersion
  storeKeywordSearch: typeof storeKeywordSearchAction
} & OperatorsReducersState;

interface OperatorPageState {
  installShown: boolean
  refreshed: boolean
  keywordSearch: string
  exampleYamlShown: boolean,
  crdExample: NormalizedCrdPreview | null
}

class OperatorPage extends React.PureComponent<OperatorPageProps, OperatorPageState> {

  static propTypes;
  static defaultProps;

  state: OperatorPageState = {
    installShown: false,
    refreshed: false,
    keywordSearch: '',
    exampleYamlShown: false,
    crdExample: null
  };

  componentDidMount() {
    const { olmVersionUpdated, fetchOlmVersion, match } = this.props;
    const {packageName, channel, operatorId} = match.params;

    if (!olmVersionUpdated) {
      fetchOlmVersion();
    }
    this.refresh(packageName, channel, operatorId);
  }

  componentDidUpdate(prevProps: OperatorPageProps) {
    const { match } = this.props;

    if (prevProps.match.url !== match.url) {
      const {packageName, channel, operatorId} = match.params;

      this.refresh(packageName, channel, operatorId);
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.refreshed && props.pending) {
      return { refreshed: true };
    }
    return null;
  }

  refresh(packageName: string, channel?: string, operatorName?: string) {
    this.props.fetchOperator(packageName, channel, operatorName);
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
      this.props.history.push(`/operator/${operator.packageName}/${channel.name}/${channel.currentCSV}`);
    }
  };

  updateVersion = version => {
    const { operator } = this.props;

    this.props.history.push(`/operator/${operator.packageName}/${operator.channel}/${version.name}`);
  };

  showInstall = e => {
    e.preventDefault();
    this.setState({ installShown: true });
  };

  hideInstall = () => {
    this.setState({ installShown: false });
  };

  showExampleYaml = (e: React.MouseEvent, crd: NormalizedCrdPreview) => {
    e.preventDefault();
    this.setState({ exampleYamlShown: true, crdExample: crd });
  };

  hideExampleYaml = () => {
    this.setState({ exampleYamlShown: false });
  };

  renderView() {
    const { operator, error, pending, errorMessage } = this.props;

    if (error) {
      return <ErrorMessage errorText={`Error retrieving operators: ${errorMessage}`} />;
    }

    if (pending || !operator) {
      return <Loader text="Loading operator" />;
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
          {longDescription && <MarkdownView markdown={longDescription} />}
          <CustomResourceDefinitionsView operator={operator} showExampleYaml={this.showExampleYaml} />
        </Grid.Col>
      </div>
    );
  }

  render() {
    const { installShown, exampleYamlShown, crdExample, refreshed, keywordSearch } = this.state;
    const { operator, pending, olmVersion } = this.props;

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
        <Breadcrumb.Item onClick={this.onHome} href={window.location.origin}>
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
        showFooter={refreshed && !pending}
      >
        {this.renderView()}
        {installShown && (
          <InstallModal
            operator={operator}
            olmVersion={olmVersion}
            onClose={this.hideInstall}
            history={this.props.history}
          />
        )}
        {exampleYamlShown && crdExample && (
          <ExampleYamlModal
            show={exampleYamlShown}
            customResourceDefinition={crdExample}
            onClose={this.hideExampleYaml}
          />
        )}
      </Page>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
    fetchOperator,
    fetchOlmVersion: fetchLatestOlmVersion,
    storeKeywordSearch: storeKeywordSearchAction
  }, dispatch)
});

const mapStateToProps = (state: StoreState) => ({
  ...state.operatorsState
});

OperatorPage.propTypes = {
  operator: PropTypes.object,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  pending: PropTypes.bool,
  olmVersion: PropTypes.string.isRequired,
  olmVersionUpdated: PropTypes.bool,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired,
  fetchOperator: PropTypes.func,
  fetchOlmVersion: PropTypes.func,
  storeKeywordSearch: PropTypes.func
};

OperatorPage.defaultProps = {
  operator: {},
  error: false,
  errorMessage: '',
  pending: false,
  olmVersionUpdated: false,
  fetchOperator: noop,
  storeKeywordSearch: noop,
  fetchOlmVersion: noop
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorPage);
