import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import * as _ from 'lodash-es';

import { helpers } from '../common/helpers';
import { HeaderTopBar } from './HeaderTopBar';
import Footer from './Footer';
import { Breadcrumb } from 'patternfly-react';

class Page extends React.Component {
  state = {};
  contentScrolled = scrollEvent => {
    const { scrollTop, scrollHeight, clientHeight } = scrollEvent.currentTarget;
    const scrollSpace = scrollHeight - clientHeight;
    const headerHeight = this.headerRef.clientHeight;

    if (scrollSpace > headerHeight) {
      const topBarHeight = this.topBarRef.clientHeight;
      const top = scrollTop - headerHeight + topBarHeight;
      const fixedHeightThreshold = headerHeight - this.topBarRef.clientHeight;

      this.setState({ fixedHeader: scrollTop > fixedHeightThreshold, scrollTop: top, headerHeight });
      return;
    }

    this.setState({ fixedHeader: false });
  };

  contentScrolled = scrollEvent => {
    const { scrollTop, scrollHeight, clientHeight } = scrollEvent.currentTarget;
    const scrollSpace = scrollHeight - clientHeight;
    const headerHeight = this.headerRef.clientHeight;

    if (scrollSpace > headerHeight) {
      const topBarHeight = this.topBarRef.clientHeight;
      const toolbarHeight = this.toolbarRef ? this.toolbarRef.clientHeight : 0;
      const top = scrollTop - headerHeight + topBarHeight;
      const fixedHeightThreshold = headerHeight - this.topBarRef.clientHeight;

      this.setState({ fixedHeader: scrollTop > fixedHeightThreshold, scrollTop: top, headerHeight, toolbarHeight });
      return;
    }

    this.setState({ fixedHeader: false });
  };

  onHeaderWheel = wheelEvent => {
    this.scrollRef.scrollTop -= _.get(wheelEvent, 'nativeEvent.wheelDelta', 0);
  };

  setScrollRef = ref => {
    this.scrollRef = ref;
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

  renderToolbar(toolbarContent) {
    const { fixedHeader, scrollTop, headerHeight } = this.state;
    const toolbarStyle = fixedHeader ? { top: scrollTop || 0, marginTop: headerHeight || 0 } : null;

    return (
      <div className="oh-operator-page__toolbar" style={toolbarStyle} ref={this.setToolbarRef}>
        <div className="oh-operator-page__toolbar__inner">
          {toolbarContent}
        </div>
      </div>
    );
  }

  render() {
    const { className, pageClasses, headerContent, toolbarContent, children, searchValue, onSearchChange, clearSearch, searchCallback } = this.props;
    const { fixedHeader, scrollTop, headerHeight, toolbarHeight } = this.state;
    const headStyle = fixedHeader ? { top: scrollTop || 0 } : null;
    const contentStyle = fixedHeader ? { marginTop: headerHeight + toolbarHeight || 0 } : null;
    const scrollableClases = classNames('content-scrollable', className);
    const ohPageClasses = classNames('oh-page', { 'oh-page-fixed-header': fixedHeader }, pageClasses);

    return (
      <div className={scrollableClases} onScroll={this.contentScrolled} ref={this.setScrollRef}>
        <div className={ohPageClasses}>
          <div className="oh-header" ref={this.setHeaderRef} style={headStyle}>
            <div className="oh-header__inner">
              <HeaderTopBar
                onSearchChange={onSearchChange}
                clearSearch={clearSearch}
                searchValue={searchValue}
                searchCallback={searchCallback}
                barRef={this.setTopBarRef}
              />
              <div className="oh-header__content">{headerContent}</div>
            </div>
          </div>
          {toolbarContent && this.renderToolbar(toolbarContent)}
          <div className="oh-page__content">
            <div className="oh-content oh-content-hub" style={contentStyle}>
              {children}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}

Page.propTypes = {
  className: PropTypes.string,
  pageClasses: PropTypes.string,
  headerContent: PropTypes.node.isRequired,
  toolbarContent: PropTypes.node,
  children: PropTypes.node,
  onHome: PropTypes.func,
  searchValue: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func,
  searchCallback: PropTypes.func,
  clearSearch: PropTypes.func.isRequired
};

Page.defaultProps = {
  className: '',
  pageClasses: '',
  toolbarContent: null,
  children: null,
  onHome: helpers.noop,
  onSearchChange: helpers.noop,
  searchCallback: helpers.noop
};

export default Page;
