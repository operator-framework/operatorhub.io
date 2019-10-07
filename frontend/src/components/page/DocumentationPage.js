import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb } from 'patternfly-react';

import Page from './Page';
import { helpers } from '../../common';
import { reduxConstants } from '../../redux/index';

const idFromTitle = title => title.replace(/ /g, '-');

class DocumentationPage extends React.Component {
  state = { topperHeight: 0, keywordSearch: '' };

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

  onScroll = (scrollTop, topperHeight) => {
    this.setState({ topperHeight });
  };

  scrollTo = (e, id) => {
    e.preventDefault();
    document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      window.location.hash = id;
    }, 500);
  };

  renderSection = (sectionTitle, sectionContent) => {
    const offset = (this.state.topperHeight || 0) - 60;

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

    const sectionLinks = sections.map(section => this.renderSectionLink(section.title));

    return (
      <React.Fragment>
        <div className="oh-documentation-page__sidebar__content-fixed hidden-xs">{sectionLinks}</div>
        <div className="oh-documentation-page__sidebar__content visible-xs">
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
    const { keywordSearch } = this.state;

    return (
      <Page
        className="oh-page-documentation"
        toolbarContent={this.renderToolbarContent()}
        history={history}
        searchValue={keywordSearch}
        onSearchChange={this.onSearchChange}
        clearSearch={this.clearSearch}
        searchCallback={this.searchCallback}
        scrollCallback={this.onScroll}
      >
        <div className="oh-documentation-page row">
          <div className="oh-documentation-page__sidebar col-md-3 col-md-push-9 col-sm-4 col-sm-push-8 col-xs-12">
            {this.renderSidebar()}
          </div>
          <div className="col-md-9 col-md-pull-3 col-sm-8 col-sm-pull-4 col-xs-12">{this.renderContent()}</div>
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
