import * as React from 'react';
import * as _ from 'lodash-es';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import { Alert, Breadcrumb, DropdownButton, EmptyState, Grid, MenuItem, Modal } from 'patternfly-react';
import { PropertiesSidePanel, PropertyItem } from 'patternfly-react-extensions';

import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { normalizeOperators } from '../../utils/operatorUtils';
import { helpers } from '../../common/helpers';
import { fetchOperators } from '../../services/operatorsService';
import { MarkdownView } from '../../components/MarkdownView';
import { ExternalLink } from '../../components/ExternalLink';

class OperatorPage extends React.Component {
  state = {
    operator: {}
  };

  componentDidMount() {
    this.refresh();
  }

  componentDidUpdate(prevProps) {
    if (_.size(this.props.operators) && !_.isEqual(this.props.operators, prevProps.operators)) {
      const newOperators = normalizeOperators(this.props.operators);
      this.setState({ operator: newOperators[0] });
    }
  }

  refresh() {
    const { match } = this.props;
    this.props.fetchOperators(_.get(match, 'params.operatorId'));
  }

  onHome(e) {
    e.preventDefault();
    this.props.history.push('/');
  }

  updateVersion = operator => {
    this.setState({ operator });
  };

  renderPendingMessage = () => {
    const { pending } = this.props;
    if (pending) {
      return (
        <Modal bsSize="lg" backdrop={false} show animation={false}>
          <Modal.Body>
            <div className="spinner spinner-xl" />
            <div className="text-center">Loading available operators...</div>
          </Modal.Body>
        </Modal>
      );
    }

    return null;
  };

  renderError = () => {
    const { errorMessage } = this.props;

    return (
      <EmptyState>
        <Alert type="error">
          <span>Error retrieving operators: {errorMessage}</span>
        </Alert>
        {this.renderPendingMessage()}
      </EmptyState>
    );
  };

  render() {
    const { error, pending } = this.props;
    const { operator } = this.state;

    if (error) {
      return this.renderError();
    }

    if (pending || !operator) {
      return this.renderPendingMessage();
    }

    const {
      name,
      provider,
      maturity,
      longDescription,
      links,
      version,
      versions,
      repository,
      containerImage,
      createdAt,
      maintainers
    } = operator;
    const notAvailable = <span className="properties-side-panel-pf-property-label">N/A</span>;

    const versionComponent =
      _.size(versions) > 1 ? (
        <DropdownButton className="oh-details-view__side-panel__version-dropdown" title={version} id="version-dropdown">
          {_.map(versions, (nextVersion, index) => (
            <MenuItem key={nextVersion.version} eventKey={index} onClick={() => this.updateVersion(nextVersion)}>
              {nextVersion.version}
            </MenuItem>
          ))}
        </DropdownButton>
      ) : (
        <React.Fragment>{version}</React.Fragment>
      );

    const linksComponent = _.size(links) ? (
      <React.Fragment>
        {_.map(links, link => (
          <ExternalLink key={link.name} href={link.url} text={link.name} />
        ))}
      </React.Fragment>
    ) : (
      notAvailable
    );

    const maintainersComponent = _.size(maintainers) ? (
      <React.Fragment>
        {_.map(maintainers, maintainer => (
          <React.Fragment key={maintainer.name}>
            <div>{maintainer.name}</div>
            <a href={`mailto:${maintainer.email}`}>{maintainer.email}</a>
          </React.Fragment>
        ))}
      </React.Fragment>
    ) : (
      notAvailable
    );

    return (
      <div className="oh-page">
        <Header />
        <div className="oh-content">
          <Breadcrumb>
            <Breadcrumb.Item onClick={e => this.onHome(e)} href="#">
              Home
            </Breadcrumb.Item>
            <Breadcrumb.Item active>{name}</Breadcrumb.Item>
          </Breadcrumb>
          <div className="oh-details-view">
            <Grid fluid={false}>
              <Grid.Row className="oh-details-view__content">
                <Grid.Col xs={12} sm={3} smPush={9} className="oh-details-view__side-panel">
                  <PropertiesSidePanel>
                    <PropertyItem label="Operator Version" value={versionComponent} />
                    <PropertyItem label="Operator Maturity" value={maturity || notAvailable} />
                    <PropertyItem label="Provider" value={provider || notAvailable} />
                    <PropertyItem label="Links" value={linksComponent} />
                    <PropertyItem label="Repository" value={repository || notAvailable} />
                    <PropertyItem label="Container Image" value={containerImage || notAvailable} />
                    <PropertyItem label="Created At" value={createdAt || notAvailable} />
                    <PropertyItem label="Maintainers" value={maintainersComponent} />
                  </PropertiesSidePanel>
                </Grid.Col>
                <Grid.Col xs={12} sm={9} smPull={3}>
                  <h1>{name}</h1>
                  {longDescription && <MarkdownView content={longDescription} outerScroll />}
                </Grid.Col>
              </Grid.Row>
            </Grid>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

OperatorPage.propTypes = {
  operators: PropTypes.array,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  pending: PropTypes.bool,
  match: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  fetchOperators: PropTypes.func
};

OperatorPage.defaultProps = {
  operators: [],
  error: false,
  errorMessage: '',
  pending: false,
  match: {},
  fetchOperators: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  fetchOperators: name => dispatch(fetchOperators(name))
});

const mapStateToProps = state => ({
  ...state.operatorsState
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorPage);
