import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import * as _ from 'lodash-es';

import { helpers } from '../common/helpers';
import { HeaderTopBar } from './HeaderTopBar';
import Footer from './Footer';

class Page extends React.Component {
  state = { headerHeight: 0, toolbarHeight: 0 };

  componentDidMount() {
    const headerHeight = _.get(this.headerRef, 'clientHeight') || 0;
    const toolbarHeight = _.get(this.toolbarRef, 'clientHeight') || 0;

    this.setState({ headerHeight, toolbarHeight });
    this.props.scrollCallback(0, headerHeight, toolbarHeight);
  }

  contentScrolled = scrollEvent => {
    const { scrollCallback } = this.props;
    const { scrollTop, scrollHeight, clientHeight } = scrollEvent.currentTarget;
    const scrollSpace = scrollHeight - clientHeight;
    const headerHeight = this.headerRef.clientHeight;
    const topBarHeight = this.topBarRef.clientHeight;
    const toolbarHeight = this.toolbarRef ? this.toolbarRef.clientHeight : 0;
    const fixedHeightThreshold = headerHeight - topBarHeight;
    let fixedHeader = false;
    let top = 0;

    if (scrollSpace > headerHeight) {
      top = scrollTop - headerHeight + topBarHeight;
      fixedHeader = scrollTop > fixedHeightThreshold;
    }

    this.setState({ fixedHeader, scrollTop: top, headerHeight, toolbarHeight });
    scrollCallback(scrollTop, headerHeight, toolbarHeight);
  };

  setHeaderRef = ref => {
    this.headerRef = ref;
  };

  setToolbarRef = ref => {
    this.toolbarRef = ref;
  };

  setTopBarRef = ref => {
    this.topBarRef = ref;
  };

  renderHeader(headStyle) {
    const { headerContent, history, searchValue, onSearchChange, clearSearch, searchCallback, homePage } = this.props;

    return (
      <div className="oh-header" ref={this.setHeaderRef} style={headStyle}>
        <div className="oh-header__inner">
          <HeaderTopBar
            onSearchChange={onSearchChange}
            clearSearch={clearSearch}
            searchValue={searchValue}
            searchCallback={searchCallback}
            history={history}
            barRef={this.setTopBarRef}
            homePage={homePage}
          />
          {headerContent}
        </div>
      </div>
    );
  }

  renderToolbar() {
    const { toolbarContent, headerContent } = this.props;
    const { fixedHeader, scrollTop, headerHeight } = this.state;
    let toolbarStyle;

    if (!toolbarContent) {
      return null;
    }

    if (fixedHeader) {
      toolbarStyle = { top: scrollTop || 0, marginTop: headerHeight || 0 };
    } else if (!headerContent) {
      toolbarStyle = { top: headerHeight };
    }

    return (
      <div className="oh-page-toolbar" style={toolbarStyle} ref={this.setToolbarRef}>
        <div className="oh-page-toolbar__inner">{toolbarContent}</div>
      </div>
    );
  }

  render() {
    const { className, headerContent, children, history, showFooter } = this.props;

    const { fixedHeader, scrollTop, headerHeight, toolbarHeight } = this.state;
    const isFixed = fixedHeader || !headerContent;
    const headStyle = isFixed ? { top: scrollTop || 0 } : null;
    const contentStyle = isFixed ? { marginTop: headerHeight + toolbarHeight } : null;
    const ohPageClasses = classNames('content-scrollable oh-page', { 'oh-page-fixed-header': isFixed }, className);

    return (
      <div className={ohPageClasses} onScroll={this.contentScrolled}>
        {this.renderHeader(headStyle)}
        {this.renderToolbar()}
        <div className="oh-page-contents">
          <div className="oh-page-contents__inner" style={contentStyle}>
            {children}
          </div>
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
  onSearchChange: helpers.noop,
  searchCallback: helpers.noop,
  clearSearch: helpers.noop,
  homePage: false,
  scrollCallback: helpers.noop
};

export default Page;
