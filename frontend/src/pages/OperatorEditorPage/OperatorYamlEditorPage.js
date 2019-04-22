import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { safeLoad, safeDump } from 'js-yaml';
import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import YamlViewer from '../../components/YamlViewer';
import OperatorEditorPage from './OperatorEditorPage';

class OperatorYamlEditorPage extends React.Component {
  state = {
    yaml: '',
    yamlError: null
  };

  componentDidMount() {
    const { operator } = this.props;
    this.updateYaml(operator);
  }

  updateYaml = operator => {
    let yaml;
    let yamlError = null;
    try {
      yaml = safeDump(operator);
    } catch (e) {
      yamlError = e;
    }

    this.setState({ yaml, yamlError });
  };

  onYamlChange = yaml => {
    const { storeEditorOperator } = this.props;

    let yamlError;
    try {
      const updatedOperator = safeLoad(yaml);
      yamlError = '';
      storeEditorOperator(updatedOperator);
    } catch (e) {
      yamlError = e.message;
    }
    this.setState({ yamlError });
  };

  renderHeader = () => (
    <div className="oh-operator-editor-page__header">
      <h1>Edit your Cluster Service Version (CSV) YAML for your Operator</h1>
    </div>
  );

  render() {
    const { history } = this.props;
    const { yaml, yamlError } = this.state;

    return (
      <OperatorEditorPage
        title="YAML Editor"
        header={this.renderHeader()}
        isForm={false}
        okToPreview={!yamlError}
        history={history}
      >
        <YamlViewer
          onBlur={updatedYaml => this.onYamlChange(updatedYaml)}
          editable
          yaml={yaml}
          error={yamlError}
          allowClear={false}
        />
      </OperatorEditorPage>
    );
  }
}

OperatorYamlEditorPage.propTypes = {
  operator: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorYamlEditorPage.defaultProps = {
  operator: {},
  storeEditorOperator: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  storeEditorOperator: operator =>
    dispatch({
      type: reduxConstants.SET_EDITOR_OPERATOR,
      operator
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorYamlEditorPage);
