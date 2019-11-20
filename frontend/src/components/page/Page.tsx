import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash-es';
import { History } from 'history';

import { noop } from '../../common/helpers';
import { HeaderTopBar } from './HeaderTopBar';
import Footer from './Footer';

export interface PageProps {
  history: History
  searchValue: string
  className?: string
  headerContent?: ReactNode
  toolbarContent?: ReactNode
  showFooter?: boolean
  children?: ReactNode
  homePage?: boolean
  onSearchChange?: (value: string) => void
  searchCallback?: (value: string) => void
  clearSearch?: () => void
  scrollCallback?: (top: number, topBarHeight: number, toolbarHeight: number) => void
}

interface PageState {
  scrolled: boolean
  toolbarFixed: boolean
}

class Page extends React.PureComponent<PageProps, PageState> {

  static propTypes;
  static defaultProps: Partial<PageProps>;

  state: PageState = { scrolled: false, toolbarFixed: false };

  headerRef: HTMLElement | null;
  topBarRef: HTMLElement | null;
  toolbarRef: HTMLElement | null;

  componentDidMount() {
    this.props.scrollCallback!(
      0,
      _.get(this.topBarRef, 'clientHeight') || 0,
      _.get(this.toolbarRef, 'clientHeight') || 0
    );

    window.addEventListener('scroll', this.contentScrolled);

    const scrollToElem = document.getElementById('page-top');
    scrollToElem && scrollToElem.scrollIntoView();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.contentScrolled);
  }

  contentScrolled = () => {
    const { toolbarContent, headerContent, scrollCallback } = this.props;
    const scrollTop = window.pageYOffset;
    const scrolled = scrollTop > 30;

    const toolbarFixed =
      !headerContent ||
      (!!toolbarContent && !!this.headerRef && !!this.topBarRef &&
        (scrollTop > this.headerRef.offsetHeight - this.topBarRef.offsetHeight)
      );

    this.setState({ scrolled, toolbarFixed });

    scrollCallback!(
      scrollTop,
      _.get(this.topBarRef, 'clientHeight') || 0,
      _.get(this.toolbarRef, 'clientHeight') || 0
    );
  };

  setTopBarRef = ref => {
    this.topBarRef = ref;
  };

  setToolbarRef = ref => {
    this.toolbarRef = ref;
  };

  setHeaderRef = ref => {
    this.headerRef = ref;
  };

  render() {
    const {
      className,
      children,
      history,
      headerContent,
      toolbarContent,
      showFooter,
      searchValue,
      onSearchChange,
      clearSearch,
      searchCallback,
      homePage
    } = this.props;
    const { toolbarFixed } = this.state;
    const topBarHeight = _.get(this.topBarRef, 'clientHeight', 0);
    const toolbarHeight = _.get(this.toolbarRef, 'clientHeight', 0);

    const ohPageClasses = classNames('oh-page', className);

    let pageStyle;
    if (!headerContent) {
      pageStyle = { marginTop: topBarHeight + toolbarHeight };
    } else if (toolbarFixed) {
      pageStyle = { marginTop: toolbarHeight };
    }

    const headerContentStyle = { paddingTop: topBarHeight };
    const toolbarClasses = classNames('oh-page-toolbar', { fixed: toolbarFixed || !headerContent });
    const toolbarStyle = { top: topBarHeight };

    return (
      <div id="page-top" className={ohPageClasses} onScroll={this.contentScrolled}>
        <HeaderTopBar
          scrolled={this.state.scrolled || !headerContent}
          onSearchChange={onSearchChange!}
          clearSearch={clearSearch!}
          searchValue={searchValue}
          searchCallback={searchCallback!}
          history={history}
          barRef={this.setTopBarRef}
          homePage={homePage}
        />
        {headerContent && (
          <div className="oh-header" style={headerContentStyle} ref={this.setHeaderRef}>
            <div className="oh-header__inner">{headerContent}</div>
          </div>
        )}
        {toolbarContent && (
          <div className={toolbarClasses} ref={this.setToolbarRef} style={toolbarStyle}>
            <div className="oh-page-toolbar__inner">{toolbarContent}</div>
          </div>
        )}
        <div className="oh-page-contents" style={pageStyle}>
          <div className="oh-page-contents__inner">{children}</div>
        </div>
        <Footer history={history} visible={showFooter} />
      </div>
    );
  }
}

Page.propTypes = {
  className: PropTypes.string,
  headerContent: PropTypes.node,
  toolbarContent: PropTypes.node,
  showFooter: PropTypes.bool,
  children: PropTypes.node,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchCallback: PropTypes.func,
  clearSearch: PropTypes.func,
  homePage: PropTypes.bool,
  scrollCallback: PropTypes.func
};

Page.defaultProps = {
  className: '',
  headerContent: null,
  toolbarContent: null,
  showFooter: true,
  children: null,
  searchValue: undefined,
  onSearchChange: noop,
  searchCallback: noop,
  clearSearch: noop,
  homePage: false,
  scrollCallback: noop 
};

export default Page;
