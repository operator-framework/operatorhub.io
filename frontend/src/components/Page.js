import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import * as _ from 'lodash-es';

import { helpers } from '../common/helpers';
import { HeaderTopBar } from './HeaderTopBar';
import Footer from './Footer';

class Page extends React.Component {
  state = { fixedHeader: false };

  componentDidMount() {
    const topperHeight = _.get(this.topperRef, 'clientHeight') || 0;
    this.props.scrollCallback(0, topperHeight);
  }

  contentScrolled = scrollEvent => {
    const { scrollCallback } = this.props;
    const { scrollTop } = scrollEvent.currentTarget;
    const headerHeight = this.headerRef.clientHeight;
    const topBarHeight = this.topBarRef.clientHeight;
    const fixedHeightThreshold = headerHeight - topBarHeight;

    this.setState({ fixedHeader: scrollTop > fixedHeightThreshold });

    const topperHeight = _.get(this.topperRef, 'clientHeight') || 0;
    scrollCallback(scrollTop, topperHeight);
  };

  setTopperRef = ref => {
    this.topperRef = ref;
  };

  setHeaderRef = ref => {
    this.headerRef = ref;
  };

  setTopBarRef = ref => {
    this.topBarRef = ref;
  };

  renderHeaderTopBar(fixed) {
    const { history, searchValue, onSearchChange, clearSearch, searchCallback, homePage } = this.props;
    return (
      <HeaderTopBar
        onSearchChange={onSearchChange}
        clearSearch={clearSearch}
        searchValue={searchValue}
        searchCallback={searchCallback}
        history={history}
        barRef={ref => {
          !fixed && this.setTopBarRef(ref);
        }}
        homePage={homePage}
      />
    );
  }

  renderTopper() {
    const { headerContent, toolbarContent } = this.props;

    return (
      <div className="oh-page-topper" ref={this.setTopperRef}>
        <div className="oh-header" ref={this.setHeaderRef}>
          <div className="oh-header__inner">
            {this.renderHeaderTopBar(false)}
            {headerContent}
          </div>
        </div>
        {toolbarContent && (
          <div className="oh-page-toolbar">
            <div className="oh-page-toolbar__inner">{toolbarContent}</div>
          </div>
        )}
      </div>
    );
  }

  renderFixedTopper() {
    const { toolbarContent } = this.props;
    return (
      <div className="oh-page-topper oh-page-topper-fixed">
        <div className="oh-header">
          <div className="oh-header__inner">{this.renderHeaderTopBar(true)}</div>
        </div>
        {toolbarContent && (
          <div className="oh-page-toolbar">
            <div className="oh-page-toolbar__inner">{toolbarContent}</div>
          </div>
        )}
      </div>
    );
  }

  render() {
    const { className, headerContent, children, history, showFooter } = this.props;

    const { fixedHeader } = this.state;
    const isFixed = fixedHeader || !headerContent;
    const ohPageClasses = classNames('content-scrollable oh-page', className);

    return (
      <div className={ohPageClasses} onScroll={this.contentScrolled}>
        {this.renderTopper()}
        {isFixed && this.renderFixedTopper()}
        <div className="oh-page-contents">
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
  onSearchChange: helpers.noop,
  searchCallback: helpers.noop,
  clearSearch: helpers.noop,
  homePage: false,
  scrollCallback: helpers.noop
};

export default Page;
