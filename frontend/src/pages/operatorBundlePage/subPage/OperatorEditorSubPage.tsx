import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { History } from 'history';
import { bindActionCreators } from 'redux';
import { match } from 'react-router';

import { noop, debounce } from '../../../common/helpers';
import Page from '../../../components/page/Page';
import { operatorFieldDescriptions } from '../../../utils/operatorDescriptors';
import {
  setSectionStatusAction,
  storeKeywordSearchAction,
  showConfirmationModalAction,
  updatePackageOperatorVersionAction,
  resetPackageEditorAction,
  showClearOperatorPackageModalAction,
  hideConfirmModalAction
} from '../../../redux/actions';
import { EDITOR_STATUS, EditorSectionNames } from '../../../utils/constants';
import EditorButtonBar from './EditorButtonBar';
import EditorBreadcrumbs from './EditorBreadCrumbs';
import { StoreState } from '../../../redux';
import { updateChannelEditorOnExit } from '../bundlePageUtils';

const OperatorEditorSubPageActions = {
  storeKeywordSearch: storeKeywordSearchAction,
  setSectionStatus: setSectionStatusAction,
  updatePackageOperatorVersion: updatePackageOperatorVersionAction,
  showResetPackageConfirmationModal: showClearOperatorPackageModalAction,
  hideConfirmModal: hideConfirmModalAction,
  resetPackage: resetPackageEditorAction,
  showPageErrorsMessage: () =>
    showConfirmationModalAction({
      title: 'Errors',
      heading: 'There are errors or missing required fields on the page',
      confirmButtonText: 'OK'
    })
};

export type OperatorEditorSubPageProps = {
  history: History,
  match: match<{packageName: string}>
  versionEditorRootPath: string,
  title?: React.ReactElement | string
  description?: React.ReactNode
  field?: string
  header?: React.ReactNode
  buttonBar?: React.ReactNode
  secondary?: boolean
  pageId?: string
  tertiary?: boolean
  lastPage?: string
  lastPageTitle?: string
  section?: EditorSectionNames
  pageErrors?: boolean
  validatePage: () => boolean
} & ReturnType<typeof mapStateToProps> & typeof OperatorEditorSubPageActions;

interface OperatorEditorSubPageState {
  headerHeight: number
  titleHeight: number
  keywordSearch: string
}

class OperatorEditorSubPage extends React.PureComponent<OperatorEditorSubPageProps, OperatorEditorSubPageState> {

  static propTypes;
  static defaultProps;

  state: OperatorEditorSubPageState = {
    headerHeight: 0,
    titleHeight: 0,
    keywordSearch: ''
  };

  onWindowResize: any;

  titleAreaRef: HTMLElement | null;

  componentDidMount() {
    const { validatePage, setSectionStatus, section, sectionStatus } = this.props;

    this.updateTitleHeight();
    this.onWindowResize = debounce(this.updateTitleHeight, 100);
    window.addEventListener('resize', this.onWindowResize);

    // do not validate pristine page
    if (section && sectionStatus[section] !== EDITOR_STATUS.empty) {
      // validate page to display errors when opened
      if (validatePage() === false) {
        setSectionStatus(section, EDITOR_STATUS.errors);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }


  allSet = () => {
    const { validatePage, setSectionStatus, section, showPageErrorsMessage } = this.props;

    // skip if no section exists - user has to implement own button bar with validation
    if (!section) {
      // let button bar know if it should auto navigate
      return false;
    }

    if (validatePage() === false) {
      showPageErrorsMessage();
      setSectionStatus(section, EDITOR_STATUS.errors);
      return true;
    }

    setSectionStatus(section, EDITOR_STATUS.all_good);
    return true;
  };

  onScroll = (scrollTop: number, topperHeight: number, toolbarHeight: number) => {
    const { headerHeight } = this.state;
    if (headerHeight !== topperHeight + toolbarHeight) {
      this.setState({ headerHeight: topperHeight + toolbarHeight });
    }
  };

  updateTitleHeight = () => {
    const titleHeight = this.titleAreaRef ? this.titleAreaRef.scrollHeight : 0;

    this.setState({ titleHeight });
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

  setTitleAreaRef = (ref: HTMLElement | null) => {
    this.titleAreaRef = ref;
  };

  onBackToChannelEditor = () => {
    const { operator, uploads,versionEditorRootPath ,updatePackageOperatorVersion, versions } = this.props;
    const version = versionEditorRootPath.split('/').pop() as string;
    const versionMetadata = versions.find(versionMeta => versionMeta.version === version);


    updateChannelEditorOnExit(operator, uploads, version, updatePackageOperatorVersion, versionMetadata && versionMetadata.namePatternWithV);
  };

  onPackageLeave = (path: string) => {
    const { history, match, resetPackage, showResetPackageConfirmationModal, hideConfirmModal } = this.props;

    showResetPackageConfirmationModal(match.params.packageName, () => {
      hideConfirmModal();
      resetPackage();
      history.push(path);
    });

    return false;
  };

  render() {
    const {
      history,
      header,
      title = '',
      versionEditorRootPath,
      field,
      description = null,
      children,
      pageId,
      buttonBar,
      secondary,
      lastPage,
      lastPageTitle,
      tertiary,
      pageErrors = false
    } = this.props;
    const { keywordSearch, headerHeight, titleHeight } = this.state;

    return (
      <Page
        className="oh-page-operator-editor"
        toolbarContent={
          <EditorBreadcrumbs
            sectionSubPath={lastPage}
            sectionLabel={lastPageTitle}
            history={history}
            currentLabel={title}
            versionEditorRootPath={versionEditorRootPath}
            onEditorExit={this.onBackToChannelEditor}
            onPackageLeave={this.onPackageLeave}
          />
        }
        history={history}
        searchValue={keywordSearch}
        onSearchChange={this.onSearchChange}
        clearSearch={this.clearSearch}
        searchCallback={this.searchCallback}
        scrollCallback={this.onScroll}
      >
        <div className="oh-operator-editor-page" id={pageId}>
          <div className="oh-operator-editor-page__title-area" ref={this.setTitleAreaRef} style={{ top: headerHeight }}>
            <div className="oh-operator-editor-page__title-area__inner">
              {header || (
                <React.Fragment>
                  <h1>{title}</h1>
                  {description}
                  <p>{!description && _.get(operatorFieldDescriptions, field || '')}</p>
                </React.Fragment>
              )}
            </div>
          </div>
          <div className="oh-operator-editor-page__page-area" style={{ marginTop: titleHeight || 0 }}>
            {children}
          </div>
          {buttonBar ||
            <EditorButtonBar
              versionEditorRootPath={versionEditorRootPath}
              lastPageSubPath={lastPage}
              lastPageTitle={lastPageTitle}
              history={history}
              title={title}
              secondary={secondary}
              tertiary={tertiary}
              pageHasErrors={pageErrors}
              onAllSet={this.allSet}
            />
          }
        </div>
      </Page>
    );
  }
}

OperatorEditorSubPage.propTypes = {
  pageId: PropTypes.string,
  header: PropTypes.node,
  buttonBar: PropTypes.node,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
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
  storeKeywordSearch: PropTypes.func,
  sectionStatus: PropTypes.object
};

OperatorEditorSubPage.defaultProps = {
  pageId: 'oh-editor-page',
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
  validatePage: noop,
  children: null,
  setSectionStatus: noop,
  showPageErrorsMessage: noop,
  storeKeywordSearch: noop,
  sectionStatus: {}
};

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(OperatorEditorSubPageActions, dispatch)
});

const mapStateToProps = (state: StoreState) => ({
  sectionStatus: state.editorState.sectionStatus,
  operator: state.editorState.operator,
  uploads: state.editorState.uploads,
  versions: state.packageEditorState.operatorVersions
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorEditorSubPage);
