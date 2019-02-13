import * as React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import { Breadcrumb, Grid } from 'patternfly-react';

import Page from './Page';
import { helpers } from '../common/helpers';
import { reduxConstants } from '../redux';

class DocumentationPage extends React.Component {
  state = { scrollTop: 0, headerHeight: 0, toolbarHeight: 0 };

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
    this.setState({ scrollTop, headerHeight, toolbarHeight });
  };

  scrollTo = (e, id) => {
    e.preventDefault();
    document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  renderSection = (sectionTitle, sectionContent) => {
    const offset = this.state.headerHeight + this.state.toolbarHeight - 60;
    return (
      <React.Fragment key={sectionTitle}>
        <div style={{ marginTop: -offset }} />
        <div id={sectionTitle} style={{ height: offset }} />
        <h2>{sectionTitle}</h2>
        {sectionContent}
      </React.Fragment>
    );
  };

  renderSectionLink = sectionTitle => (
    <div key={sectionTitle} className="oh-documentation-page__sidebar__link">
      <a href="#" onClick={e => this.scrollTo(e, sectionTitle)}>
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
      <div>
        <div className="oh-documentation-page__sidebar__content hidden-sm hidden-xs hidden-xss" style={{ marginTop: scrollTop }}>
          {sectionLinks}
        </div>
        <div className="oh-documentation-page__sidebar__content visible-sm visible-xs visible-xxs">
          {sections.map(section => this.renderSectionLink(section.title))}
        </div>
      </div>
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
          <Grid.Col xs={12} sm={4} smPush={8} md={3} mdPush={9} className="oh-documentation-page__sidebar">
            {this.renderSidebar()}
          </Grid.Col>
          <Grid.Col xs={12} sm={8} smPull={4} md={9} mdPull={3}>
            {this.renderContent()}
          </Grid.Col>
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
