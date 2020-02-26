import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { safeLoad } from 'js-yaml';
import { Breadcrumb, Grid } from 'patternfly-react';

import { noop } from '../../common/helpers';
import { MarkdownView } from '../../components/MarkdownView';
import Page from '../../components/page/Page';
import ExampleYamlModal from '../../components/modals/ExampleYamlModal';
import { storeKeywordSearchAction } from '../../redux';
import YamlViewer from '../../components/YamlViewer';
import { normalizeOperator } from '../../utils/operatorUtils';
import OperatorSidePanel from '../../components/OperatorSidePanel';
import CustomResourceDefinitionsView from '../../components/CustomResourceDefinitionsView';
import OperatorTile from '../../components/OperatorTile';
import OperatorListItem from '../../components/OperatorListItem';
import { ExternalLink } from '../../components/ExternalLink';
import { buildYourCSV, operatorBundle, operatorCourier, operatorScorecard } from '../../utils/documentationLinks';
import { History } from 'history';
import { Operator, NormalizedCrdPreview, NormalizedOperatorPreview } from '../../utils/operatorTypes';
import { bindActionCreators } from 'redux';

export interface OperatorPreviewPageProps {
  history: History
  storeKeywordSearch: typeof storeKeywordSearchAction
}

interface OperatorPreviewPageState {
  operator: NormalizedOperatorPreview | null
  yamlError: string
  exampleYamlShown: boolean
  keywordSearch: string
  crdExample: NormalizedCrdPreview | null
}

class OperatorPreviewPage extends React.PureComponent<OperatorPreviewPageProps, OperatorPreviewPageState> {

  static propTypes;
  static defaultProps;

  state: OperatorPreviewPageState = {
    operator: null,
    yamlError: '',
    exampleYamlShown: false,
    keywordSearch: '',
    crdExample: null
  };

  componentDidMount() {
    setTimeout(() => this.forceUpdate(), 1);
  }

  onHome = e => {
    e.preventDefault();
    this.props.history.push('/');
  };

  onSearchChange = (searchValue: string) => {
    this.setState({ keywordSearch: searchValue });
  };

  clearSearch = () => {
    this.onSearchChange('');
  };

  searchCallback = (searchValue: string) => {
    if (searchValue) {
      this.props.storeKeywordSearch(searchValue);
      this.props.history.push(`/?keyword=${searchValue}`);
    }
  };

  showExampleYaml = (e: React.MouseEvent, crd: NormalizedCrdPreview) => {
    e.preventDefault();
    this.setState({ exampleYamlShown: true, crdExample: crd });
  };

  hideExampleYaml = () => {
    this.setState({ exampleYamlShown: false });
  };

  previewYAML = (yaml?: string) => {
    if (!yaml) {
      this.setState({ operator: null, yamlError: '' });
      return;
    }

    try {
      const yamlOperator = safeLoad(yaml);
      const operator = normalizeOperator(yamlOperator);
      this.setState({ operator, yamlError: '' });

      setTimeout(() => {
        const element = document.getElementById('operator-preview');
        element && element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

    } catch (e) {
      this.setState({ operator: null, yamlError: e.message });
    }
  };

  render() {
    const { operator, exampleYamlShown, crdExample, keywordSearch, yamlError } = this.state;

    const toolbarContent = (
      <Breadcrumb>
        <Breadcrumb.Item onClick={e => this.onHome(e)} href={window.location.origin}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Operator Preview</Breadcrumb.Item>
      </Breadcrumb>
    );

    return (
      <Page
        className="oh-page-operator-preview"
        toolbarContent={toolbarContent}
        history={this.props.history}
        searchValue={keywordSearch}
        onSearchChange={this.onSearchChange}
        clearSearch={this.clearSearch}
        searchCallback={this.searchCallback}
      >
        <div className="oh-operator-preview-page">
          <h1>Operator Preview</h1>
          <p>
            This preview editor helps you verify visual appearance of styling of your Operator’s appearance on
            OperatorHub.io.
            <br />
            Please use <ExternalLink href={operatorCourier} text="operator-courier" /> to validate your{' '}
            <span className="oh-code">ClusterServiceVersion</span> for completeness and syntax. Read more{' '}
            <ExternalLink href={buildYourCSV} text="here" /> on how to create your CSV.
            <br />
            <br />
            <b>Important:</b> This preview and operator-courier only check for syntax of your CSV. Please use the{' '}
            <ExternalLink href={operatorScorecard} text="scorecard" /> utility which is part of the operator-sdk to
            validate your entire&nbsp;
            <ExternalLink href={operatorBundle} text="Operator bundle" />
          </p>
          <h2>Enter your operator&apos;s CSV YAML:</h2>
          <div className="oh-preview-page-yaml">
            <YamlViewer isPreview onSave={this.previewYAML} editable error={yamlError} saveButtonText="Preview Operator" />
          </div>
          {operator && (
            <React.Fragment>
              <h2>Preview of your Operator</h2>
              <div id="operator-preview" className="oh-preview-page-yaml__card-container">
                <OperatorTile operator={operator} />
                <OperatorListItem operator={operator} />
              </div>
              <div className="oh-preview-page-yaml__preview-separator" />
              <div className="oh-operator-page row">
                <Grid.Col xs={12} sm={4} smPush={8} md={3} mdPush={9}>
                  <OperatorSidePanel operator={operator} />
                </Grid.Col>
                <Grid.Col xs={12} sm={8} smPull={4} md={9} mdPull={3}>
                  <h1>{operator.displayName}</h1>
                  {operator.longDescription && <MarkdownView markdown={operator.longDescription} />}
                  <CustomResourceDefinitionsView operator={operator} showExampleYaml={this.showExampleYaml} />
                </Grid.Col>
              </div>
            </React.Fragment>
          )}
        </div>
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

OperatorPreviewPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  storeKeywordSearch: PropTypes.func
};

OperatorPreviewPage.defaultProps = {
  storeKeywordSearch: noop
};

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
    storeKeywordSearch: storeKeywordSearchAction
  }, dispatch)

});

const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorPreviewPage);
