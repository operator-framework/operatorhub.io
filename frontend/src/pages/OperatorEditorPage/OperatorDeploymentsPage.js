import * as React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import * as _ from 'lodash-es';
import { Breadcrumb } from 'patternfly-react';

import { helpers } from '../../common/helpers';
import Page from '../../components/page/Page';
import { reduxConstants } from '../../redux';
import { getFieldValueError } from '../../utils/operatorUtils';
import DeploymentsEditor from '../../components/editor/DeploymentsEditor';
import { operatorFieldDescriptions } from '../../utils/operatorDescriptors';

class OperatorDeploymentsPage extends React.Component {
  state = {
    headerHeight: 0,
    titleHeight: 0
  };

  componentDidMount() {
    this.updateTitleHeight();
    this.onWindowResize = helpers.debounce(this.updateTitleHeight, 100);
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onScroll = (scrollTop, topperHeight, toolbarHeight) => {
    const { headerHeight } = this.state;
    if (headerHeight !== topperHeight + toolbarHeight) {
      this.setState({ headerHeight: topperHeight + toolbarHeight });
    }
  };

  updateTitleHeight = () => {
    this.setState({ titleHeight: this.titleAreaRef.scrollHeight });
  };

  onHome = e => {
    e.preventDefault();
    this.props.history.push('/');
  };

  onBack = e => {
    e.preventDefault();
    this.props.history.push('/editor');
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

  updateOperator = (value, field) => {
    const { operator, storeEditorOperator } = this.props;

    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, field, value);
    storeEditorOperator(updatedOperator);
  };

  validateField = field => {
    const { operator, formErrors, storeEditorFormErrors } = this.props;

    const error = getFieldValueError(operator, field);
    _.set(formErrors, field, error);
    storeEditorFormErrors(formErrors);
  };

  updateOperatorDeployments = deployments => {
    const operatorDeployments = _.reduce(
      deployments,
      (updatedDeployments, deployment) => {
        if (deployment.deploymentObj) {
          updatedDeployments.push(deployment.deploymentObj);
        }
        return updatedDeployments;
      },
      []
    );
    this.updateOperator(operatorDeployments, 'spec.install.spec.deployments');
    this.validateField('spec.install.spec.deployments');
  };

  setTitleAreaRef = ref => {
    this.titleAreaRef = ref;
  };

  render() {
    const { operator } = this.props;
    const { keywordSearch, headerHeight, titleHeight } = this.state;

    const toolbarContent = (
      <Breadcrumb>
        <Breadcrumb.Item onClick={e => this.onHome(e)} href={window.location.origin}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item onClick={e => this.onBack(e)} href={`${window.location.origin}/Operator Editor`}>
          Operator Editor
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Deployments</Breadcrumb.Item>
      </Breadcrumb>
    );

    return (
      <Page
        className="oh-page-operator-editor"
        toolbarContent={toolbarContent}
        history={this.props.history}
        searchValue={keywordSearch}
        onSearchChange={this.onSearchChange}
        clearSearch={this.clearSearch}
        searchCallback={this.searchCallback}
        scrollCallback={this.onScroll}
      >
        <div className="oh-operator-editor-page">
          <div className="oh-operator-editor-page__title-area" ref={this.setTitleAreaRef} style={{ top: headerHeight }}>
            <div className="oh-operator-editor-page__title-area__inner">
              <h1>Deployments</h1>
              <p>{_.get(operatorFieldDescriptions, 'spec.install.spec.deployments')}</p>
            </div>
          </div>
          <div className="oh-operator-editor-page__page-area" style={{ marginTop: titleHeight || 0 }}>
            <DeploymentsEditor operator={operator} onUpdate={this.updateOperatorDeployments} />
          </div>
        </div>
      </Page>
    );
  }
}

OperatorDeploymentsPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  storeKeywordSearch: PropTypes.func
};

OperatorDeploymentsPage.defaultProps = {
  operator: {},
  formErrors: {},
  storeEditorFormErrors: helpers.noop,
  storeEditorOperator: helpers.noop,
  storeKeywordSearch: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  storeEditorOperator: operator =>
    dispatch({
      type: reduxConstants.SET_EDITOR_OPERATOR,
      operator
    }),
  storeEditorFormErrors: formErrors =>
    dispatch({
      type: reduxConstants.SET_EDITOR_FORM_ERRORS,
      formErrors
    }),
  storeKeywordSearch: keywordSearch =>
    dispatch({
      type: reduxConstants.SET_KEYWORD_SEARCH,
      keywordSearch
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorDeploymentsPage);
