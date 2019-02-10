import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import * as _ from 'lodash-es';

import { helpers } from '../common/helpers';
import { HeaderTopBar } from './HeaderTopBar';
import Footer from './Footer';

class Page extends React.Component {
  state = {};

  onHome = e => {
    e.preventDefault();
    if (!this.props.homePage) {
      this.props.history.push('/');
    }
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
      <div className="oh-page__toolbar" style={toolbarStyle} ref={this.setToolbarRef}>
        <div className="oh-page__toolbar__inner">{toolbarContent}</div>
      </div>
    );
  }

  render() {
    const {
      className,
      pageClasses,
      headerContent,
      toolbarContent,
      children,
      history,
      searchValue,
      onSearchChange,
      clearSearch,
      searchCallback
    } = this.props;
    const { fixedHeader, scrollTop, headerHeight, toolbarHeight } = this.state;
    const headStyle = fixedHeader ? { top: scrollTop || 0 } : null;
    const contentStyle = fixedHeader ? { marginTop: headerHeight + toolbarHeight || 0 } : null;
    const scrollableClasses = classNames('content-scrollable', className);
    const ohPageClasses = classNames('oh-page', { 'oh-page-fixed-header': fixedHeader || !headerContent }, pageClasses);

    return (
      <div className={scrollableClasses} onScroll={this.contentScrolled}>
        <div className={ohPageClasses}>
          <div className="oh-header" ref={this.setHeaderRef} style={headStyle}>
            <div className="oh-header__inner">
              <HeaderTopBar
                onSearchChange={onSearchChange}
                clearSearch={clearSearch}
                searchValue={searchValue}
                searchCallback={searchCallback}
                onHome={this.onHome}
                barRef={this.setTopBarRef}
              />
              {headerContent && <div className="oh-header__content">{headerContent}</div>}
            </div>
          </div>
          {toolbarContent && this.renderToolbar(toolbarContent)}
          <div className="oh-page__content">
            <div className="oh-content" style={contentStyle}>
              {children}
            </div>
          </div>
          <Footer history={history} />
        </div>
      </div>
    );
  }
}

Page.propTypes = {
  className: PropTypes.string,
  pageClasses: PropTypes.string,
  headerContent: PropTypes.node,
  toolbarContent: PropTypes.node,
  children: PropTypes.node,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchCallback: PropTypes.func,
  clearSearch: PropTypes.func,
  homePage: PropTypes.bool
};

Page.defaultProps = {
  className: '',
  pageClasses: '',
  headerContent: null,
  toolbarContent: null,
  children: null,
  searchValue: undefined,
  onSearchChange: helpers.noop,
  searchCallback: helpers.noop,
  clearSearch: helpers.noop,
  homePage: false
};

export default Page;
