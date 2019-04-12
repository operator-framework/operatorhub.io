import * as React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import { safeLoad } from 'js-yaml';
import { Breadcrumb, Grid } from 'patternfly-react';

import { helpers } from '../../common/helpers';
import { MarkdownView } from '../../components/MarkdownView';
import Page from '../../components/Page';
import ExampleYamlModal from '../../components/ExampleYamlModal';
import { reduxConstants } from '../../redux';
import YamlEditor from '../../components/YamlViewer';
import { normalizeOperator } from '../../utils/operatorUtils';
import { OperatorSidePanel } from '../../components/OperatorSidePanel';
import CustomResourceDefinitionsView from '../../components/CustomResourceDefinitionsView';
import OperatorTile from '../../components/OperatorTile';
import OperatorListItem from '../../components/OperatorListItem';
import { ExternalLink } from '../../components/ExternalLink';
import { buildYourCSV, operatorBundle, operatorCourier, operatorScorecard } from '../../utils/documentationLinks';

const editorDescription = `Enter your operator's CSV YAML:`;

class OperatorPreviewPage extends React.Component {
  state = {
    operator: null,
    yamlError: '',
    exampleYamlShown: false
  };

  componentDidMount() {
    setTimeout(() => this.forceUpdate(), 1);
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

  showExampleYaml = (e, crd) => {
    e.preventDefault();
    this.setState({ exampleYamlShown: true, crdExample: crd });
  };

  hideExampleYaml = () => {
    this.setState({ exampleYamlShown: false });
  };

  previewYAML = yaml => {
    if (!yaml) {
      this.setState({ operator: null, yamlError: '' });
      return;
    }

    try {
      const yamlOperator = safeLoad(yaml);
      const operator = normalizeOperator(yamlOperator);
      this.setState({ operator, yamlError: '' });
      setTimeout(() => {
        document.getElementById('operator-preview').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (e) {
      this.setState({ operator: null, yamlError: e.message });
    }
  };

  renderOperatorPreview = () => {
    const { operator } = this.state;

    if (!operator) {
      return null;
    }

    return (
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
            {operator.longDescription && <MarkdownView>{operator.longDescription}</MarkdownView>}
            <CustomResourceDefinitionsView operator={operator} showExampleYaml={this.showExampleYaml} />
          </Grid.Col>
        </div>
      </React.Fragment>
    );
  };

  renderYamlEditor() {
    const { yamlError } = this.state;

    return (
      <div className="oh-preview-page-yaml">
        <YamlEditor onSave={this.previewYAML} editable error={yamlError} saveButtonText="Preview Operator" />
      </div>
    );
  }

  render() {
    const { exampleYamlShown, crdExample, keywordSearch } = this.state;

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
            Please use <ExternalLink href={operatorCourier} indicator={false} text="operator-courier" /> to validate
            your <span className="oh-code">ClusterServiceVersion</span> for completeness and syntax. Read more{' '}
            <ExternalLink href={buildYourCSV} indicator={false} text="here" /> on how to create your CSV.
            <br />
            <br />
            <b>Important:</b> This preview and operator-courier only check for syntax of your CSV. Please use the{' '}
            <ExternalLink href={operatorScorecard} indicator={false} text="scorecard" /> utility which is part of the
            operator-sdk to validate your entire{' '}
            <ExternalLink href={operatorBundle} indicator={false} text="Operator bundle" />
          </p>
          <h2>{editorDescription}</h2>
          {this.renderYamlEditor()}
          {this.renderOperatorPreview()}
        </div>
        <ExampleYamlModal
          show={exampleYamlShown}
          customResourceDefinition={crdExample}
          onClose={this.hideExampleYaml}
        />
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
  storeKeywordSearch: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  storeKeywordSearch: keywordSearch =>
    dispatch({
      type: reduxConstants.SET_KEYWORD_SEARCH,
      keywordSearch
    })
});

const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorPreviewPage);
