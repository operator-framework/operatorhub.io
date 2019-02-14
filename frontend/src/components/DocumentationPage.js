import * as React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import { Breadcrumb, Grid } from 'patternfly-react';

import Page from './Page';
import { helpers } from '../common/helpers';
import { reduxConstants } from '../redux';

const idFromTitle = title => title.replace(/ /g, '-');

class DocumentationPage extends React.Component {
  state = { scrollTop: 0, headerHeight: 0, toolbarHeight: 0 };

  componentDidMount() {
    if (!window.location.hash) {
      return;
    }

    const scrollElem = document.getElementById(window.location.hash.slice(1));
    if (scrollElem) {
      scrollElem.scrollIntoView();
    }
  }

  onHome = e => {
    e.preventDefault();
    this.props.history.push('/');
  };

  searchCallback = searchValue => {
    if (searchValue) {
      this.props.storeKeywordSearch(searchValue);
      this.props.history.push(`/?keyword=${searchValue}`);
    }
  };

  onScroll = (scrollTop, headerHeight, toolbarHeight) => {
    const maxTop = Math.min(scrollTop, this.contentRef.offsetHeight - this.sidebarRef.offsetHeight);
    this.setState({ scrollTop: maxTop, headerHeight, toolbarHeight });
  };

  scrollTo = (e, id) => {
    e.preventDefault();
    document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      window.location.hash = id;
    }, 500);
  };

  setSidebarRef = ref => {
    this.sidebarRef = ref;
  };

  setContentRef = ref => {
    this.contentRef = ref;
  };

  renderSection = (sectionTitle, sectionContent) => {
    const offset = this.state.headerHeight + this.state.toolbarHeight - 60;

    return (
      <React.Fragment key={sectionTitle}>
        <div style={{ marginTop: -offset }} />
        <div id={idFromTitle(sectionTitle)} style={{ height: offset }} />
        <h2>{sectionTitle}</h2>
        {sectionContent}
      </React.Fragment>
    );
  };

  renderSectionLink = sectionTitle => (
    <div key={sectionTitle} className="oh-documentation-page__sidebar__link">
      <a href="#" onClick={e => this.scrollTo(e, idFromTitle(sectionTitle))}>
        {sectionTitle}
      </a>
    </div>
  );

  renderToolbarContent = () => (
    <Breadcrumb>
      <Breadcrumb.Item onClick={e => this.onHome(e)} href={window.location.origin}>
        Home
      </Breadcrumb.Item>
      <Breadcrumb.Item active>{this.props.title}</Breadcrumb.Item>
    </Breadcrumb>
  );

  renderSidebar() {
    const { sections } = this.props;
    const { scrollTop } = this.state;

    const sectionLinks = sections.map(section => this.renderSectionLink(section.title));

    return (
      <React.Fragment>
        <div
          className="oh-documentation-page__sidebar__content hidden-sm hidden-xs hidden-xss"
          style={{ marginTop: scrollTop }}
          ref={this.setSidebarRef}
        >
          {sectionLinks}
        </div>
        <div className="oh-documentation-page__sidebar__content visible-sm visible-xs visible-xxs">
          {sections.map(section => this.renderSectionLink(section.title))}
        </div>
      </React.Fragment>
    );
  }

  renderContent() {
    const { title, sections } = this.props;
    return (
      <div className="oh-documentation-page__content">
        <h1>{title}</h1>
        {sections.map(section => this.renderSection(section.title, section.content))}
      </div>
    );
  }

  render() {
    const { history } = this.props;

    return (
      <Page
        className="oh-page-documentation"
        toolbarContent={this.renderToolbarContent()}
        history={history}
        onHome={this.onHome}
        searchCallback={this.searchCallback}
        scrollCallback={this.onScroll}
      >
        <div className="oh-documentation-page row">
          <div className="oh-documentation-page__sidebar col-md-3 col-md-push-9 col-sm-4 col-sm-push-8 col-xs-12">
            {this.renderSidebar()}
          </div>
          <div className="col-md-9 col-md-pull-3 col-sm-8 col-sm-pull-4 col-xs-12" ref={this.setContentRef}>
            {this.renderContent()}
          </div>
        </div>
      </Page>
    );
  }
}

DocumentationPage.propTypes = {
  title: PropTypes.node.isRequired,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.node,
      content: PropTypes.node
    })
  ).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  storeKeywordSearch: PropTypes.func
};

DocumentationPage.defaultProps = {
  storeKeywordSearch: helpers.noop
};

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  storeKeywordSearch: keywordSearch =>
    dispatch({
      type: reduxConstants.SET_KEYWORD_SEARCH,
      keywordSearch
    })
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DocumentationPage);
