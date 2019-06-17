import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as _ from 'lodash-es';
import { Breadcrumb } from 'patternfly-react';

import { helpers } from '../../common/helpers';
import Page from '../../components/page/Page';
import { operatorFieldDescriptions } from '../../utils/operatorDescriptors';
import { EDITOR_STATUS } from './bundlePageUtils';
import { setSectionStatusAction } from '../../redux/actions/editorActions';
import { reduxConstants } from '../../redux/index';

class OperatorEditorSubPage extends React.Component {
  state = {
    headerHeight: 0,
    titleHeight: 0
  };

  componentDidMount() {
    const { validatePage, setSectionStatus, section } = this.props;

    this.updateTitleHeight();
    this.onWindowResize = helpers.debounce(this.updateTitleHeight, 100);
    window.addEventListener('resize', this.onWindowResize);

    if (section) {
      if (validatePage() === false) {
        setSectionStatus(section, EDITOR_STATUS.errors);
        return;
      }
      setSectionStatus(section, EDITOR_STATUS.pending);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onHome = e => {
    e.preventDefault();
    this.props.history.push('/');
  };

  onEditor = e => {
    e.preventDefault();
    this.props.history.push('/bundle');
  };

  onBack = e => {
    e.preventDefault();
    this.props.history.push(`/bundle/${this.props.lastPage}`);
  };

  allSet = e => {
    const { validatePage, setSectionStatus, section, secondary, showPageErrorsMessage } = this.props;

    if (validatePage() === false) {
      showPageErrorsMessage();
      setSectionStatus(section, EDITOR_STATUS.errors);
      return;
    }
    setSectionStatus(section, EDITOR_STATUS.complete);

    if (secondary) {
      this.onEditor(e);
      return;
    }

    this.onBack(e);
  };

  onScroll = (scrollTop, topperHeight, toolbarHeight) => {
    const { headerHeight } = this.state;
    if (headerHeight !== topperHeight + toolbarHeight) {
      this.setState({ headerHeight: topperHeight + toolbarHeight });
    }
  };

  updateTitleHeight = () => {
    this.setState({ titleHeight: this.titleAreaRef.scrollHeight });
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

  setTitleAreaRef = ref => {
    this.titleAreaRef = ref;
  };

  renderBreadcrumbs = () => (
    <Breadcrumb>
      <Breadcrumb.Item onClick={e => this.onHome(e)} href={window.location.origin}>
        Home
      </Breadcrumb.Item>
      {(this.props.secondary || this.props.tertiary) && (
        <Breadcrumb.Item onClick={e => this.onEditor(e)} href={`${window.location.origin}/editor`}>
          Package your Operator
        </Breadcrumb.Item>
      )}
      {this.props.tertiary && (
        <Breadcrumb.Item onClick={e => this.onBack(e)} href={`${window.location.origin}/editor/${this.props.lastPage}`}>
          {this.props.lastPageTitle}
        </Breadcrumb.Item>
      )}
      <Breadcrumb.Item active>{this.props.title}</Breadcrumb.Item>
    </Breadcrumb>
  );

  renderButtonBar() {
    const { buttonBar, secondary, tertiary, pageErrors } = this.props;

    if (buttonBar) {
      return buttonBar;
    }

    if (secondary) {
      const allSetClasses = classNames('oh-button oh-button-primary', { disabled: pageErrors });

      return (
        <div className="oh-operator-editor-page__button-bar">
          <div>
            <button className="oh-button oh-button-secondary" onClick={e => this.onEditor(e)}>
              Back to Package your Operator
            </button>
          </div>
          <div>
            <button className={allSetClasses} disabled={pageErrors} onClick={e => this.allSet(e)}>
              {`All set with ${this.props.title}`}
            </button>
          </div>
        </div>
      );
    }

    if (tertiary) {
      return (
        <div className="oh-operator-editor-page__button-bar">
          <span />
          <div>
            <button className="oh-button oh-button-primary" onClick={e => this.onBack(e)}>
              {`Back to ${this.props.lastPageTitle}`}
            </button>
          </div>
        </div>
      );
    }

    return null;
  }

  render() {
    const { header, title, field, description, children } = this.props;
    const { keywordSearch, headerHeight, titleHeight } = this.state;

    return (
      <Page
        className="oh-page-operator-editor"
        toolbarContent={this.renderBreadcrumbs()}
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
              {header && header}
              {!header && (
                <React.Fragment>
                  <h1>{title}</h1>
                  {description}
                  <p>{!description && _.get(operatorFieldDescriptions, field)}</p>
                </React.Fragment>
              )}
            </div>
          </div>
          <div className="oh-operator-editor-page__page-area" style={{ marginTop: titleHeight || 0 }}>
            {children}
          </div>
          {this.renderButtonBar()}
        </div>
      </Page>
    );
  }
}

OperatorEditorSubPage.propTypes = {
  header: PropTypes.node,
  buttonBar: PropTypes.node,
  title: PropTypes.string,
  field: PropTypes.string,
  description: PropTypes.node,
  secondary: PropTypes.bool,
  tertiary: PropTypes.bool,
  lastPage: PropTypes.string,
  lastPageTitle: PropTypes.string,
  section: PropTypes.string,
  pageErrors: PropTypes.bool,
  validatePage: PropTypes.func,
  children: PropTypes.node,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  setSectionStatus: PropTypes.func,
  showPageErrorsMessage: PropTypes.func,
  storeKeywordSearch: PropTypes.func
};

OperatorEditorSubPage.defaultProps = {
  header: null,
  buttonBar: null,
  title: '',
  field: '',
  description: null,
  secondary: false,
  tertiary: false,
  lastPage: '',
  lastPageTitle: '',
  section: '',
  pageErrors: false,
  validatePage: helpers.noop,
  children: null,
  setSectionStatus: helpers.noop,
  showPageErrorsMessage: helpers.noop,
  storeKeywordSearch: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  storeKeywordSearch: keywordSearch =>
    dispatch({
      type: reduxConstants.SET_KEYWORD_SEARCH,
      keywordSearch
    }),
  setSectionStatus: (section, status) => dispatch(setSectionStatusAction(section, status)),
  showPageErrorsMessage: () =>
    dispatch({
      type: reduxConstants.CONFIRMATION_MODAL_SHOW,
      title: 'Errors',
      heading: <span>There are errors or missing required fields on the page</span>,
      confirmButtonText: 'OK'
    })
});

const mapStateToProps = state => ({
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorEditorSubPage);
