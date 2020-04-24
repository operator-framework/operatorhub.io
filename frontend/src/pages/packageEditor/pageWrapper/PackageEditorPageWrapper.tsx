import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { History } from 'history';
import { bindActionCreators } from 'redux';

import { storeKeywordSearchAction } from '../../../redux/actions';
import Page from '../../../components/page/Page';
import { debounce } from '../../../common/helpers';
import PackageEditorBreadcrumbs, { BreadcrumbsItem } from './PackageEditorBreadcrumbs';

const PackageEditorPageWrapperActions = {
  storeKeywordSearch: storeKeywordSearchAction
}

export type PackageEditorPageWrapperProps = {
  history: History
  header: React.ReactNode
  buttonBar: React.ReactNode
  breadcrumbs: BreadcrumbsItem[]
  pageId?: string,
  className?: string,
  onPackageLeave?: (path: string) => boolean
} & typeof PackageEditorPageWrapperActions;

interface PackageEditorPageWrapperState {
  headerHeight: number
  titleHeight: number
  keywordSearch: string
}

class PackageEditorPageWrapper extends React.PureComponent<PackageEditorPageWrapperProps, PackageEditorPageWrapperState> {

  state: PackageEditorPageWrapperState = {
    headerHeight: 0,
    titleHeight: 0,
    keywordSearch: ''
  };

  onWindowResize: any;

  titleAreaRef: HTMLElement | null;

  componentDidMount() {
    this.updateTitleHeight();
    this.onWindowResize = debounce(this.updateTitleHeight, 100);
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }



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

  render() {
    const {
      history,
      header,
      children,
      pageId,
      buttonBar,
      breadcrumbs,
      className,
      onPackageLeave
    } = this.props;
    const { keywordSearch, headerHeight, titleHeight } = this.state;

    return (
      <Page
        className="oh-page-operator-editor"
        toolbarContent={
          <PackageEditorBreadcrumbs
            history={history}
            items={breadcrumbs}
            onPackageLeave={onPackageLeave}
          />
        }
        history={history}
        searchValue={keywordSearch}
        onSearchChange={this.onSearchChange}
        clearSearch={this.clearSearch}
        searchCallback={this.searchCallback}
        scrollCallback={this.onScroll}
      >
        <div className={"oh-operator-editor-page" + ` ${className || ''}`} id={pageId}>
          <div className="oh-operator-editor-page__title-area" ref={this.setTitleAreaRef} style={{ top: headerHeight }}>
            <div className="oh-operator-editor-page__title-area__inner">
              {header}
            </div>
          </div>
          <div className="oh-operator-editor-page__page-area" style={{ marginTop: titleHeight || 0 }}>
            {children}
          </div>
          {buttonBar}
        </div>
      </Page>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(PackageEditorPageWrapperActions, dispatch)
});


export default connect(
  null,
  mapDispatchToProps
)(PackageEditorPageWrapper);
