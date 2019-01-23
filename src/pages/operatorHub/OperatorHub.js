import * as React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import * as _ from 'lodash-es';

import { Alert, EmptyState, Modal } from 'patternfly-react';
import { CatalogTile } from 'patternfly-react-extensions';

import { fetchOperators } from '../../services/operatorsService';
import { helpers } from '../../common/helpers';

import Footer from '../../components/Footer';
import Header from '../../components/Header';
import TileView from '../../components/TileView';
import { normalizeOperators } from '../../utils/operatorUtils';

/**
 * Filter property white list
 */
const operatorHubFilterGroups = ['providerType', 'provider', 'installState'];

const operatorHubFilterMap = {
  providerType: 'Provider Type',
  installState: 'Install State'
};

const ignoredProviderTails = [', Inc.', ', Inc', ' Inc.', ' Inc', ', LLC', ' LLC'];

const determineCategories = items => {
  const newCategories = {};
  _.each(items, item => {
    _.each(item.categories, category => {
      if (!newCategories[category]) {
        newCategories[category] = {
          id: category,
          label: category,
          field: 'categories',
          values: [category]
        };
      }
    });
  });

  return newCategories;
};

export const getProviderValue = value => {
  if (!value) {
    return value;
  }

  const providerTail = _.find(ignoredProviderTails, tail => value.endsWith(tail));
  if (providerTail) {
    return value.substring(0, value.indexOf(providerTail));
  }

  return value;
};

const providerSort = provider => {
  if (provider.value.toLowerCase() === 'red hat') {
    return '';
  }
  return provider.value;
};

const providerTypeSort = provider => {
  switch (provider.value) {
    case 'Red Hat':
      return 0;
    case 'Certified':
      return 1;
    case 'Community':
      return 2;
    case 'Custom':
      return 4;
    default:
      return 5;
  }
};

const sortFilterValues = (values, field) => {
  let sorter = ['value'];

  if (field === 'provider') {
    sorter = providerSort;
  }

  if (field === 'providerType') {
    sorter = providerTypeSort;
  }

  return _.sortBy(values, sorter);
};

const determineAvailableFilters = (initialFilters, items, filterGroups) => {
  const filters = _.cloneDeep(initialFilters);

  _.each(filterGroups, field => {
    const values = [];
    _.each(items, item => {
      let value = item[field];
      let synonyms;
      if (field === 'provider') {
        value = getProviderValue(value);
        synonyms = _.map(ignoredProviderTails, tail => `${value}${tail}`);
      }
      if (value !== undefined) {
        if (!_.some(values, { value })) {
          values.push({
            label: value,
            synonyms,
            value,
            active: false
          });
        }
      }
    });

    _.forEach(sortFilterValues(values, field), nextValue => _.set(filters, [field, nextValue.value], nextValue));
  });

  return filters;
};

export const keywordCompare = (filterString, item) => {
  if (!filterString) {
    return true;
  }
  if (!item) {
    return false;
  }

  return (
    item.name.toLowerCase().includes(filterString) ||
    (item.description && item.description.toLowerCase().includes(filterString)) ||
    (item.tags && item.tags.includes(filterString))
  );
};

class OperatorHub extends React.Component {
  state = {
    operators: []
  };

  componentDidMount() {
    this.refresh();
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(this.props.operators, prevProps.operators)) {
      const newOperators = normalizeOperators(this.props.operators);
      this.setState({ operators: newOperators });
    }
  }

  refresh() {
    this.props.fetchOperators();
  }

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

  openDetails = (event, operator) => {
    event.preventDefault();
    this.props.history.push(`/operator/${operator.name}`);
  };

  renderTile = item => {
    if (!item) {
      return null;
    }

    const { name, imgUrl, provider, description } = item;
    const vendor = provider ? `provided by ${provider}` : null;

    return (
      <CatalogTile
        id={name}
        key={name}
        title={name}
        iconImg={imgUrl}
        vendor={vendor}
        description={description}
        onClick={e => this.openDetails(e, item)}
      />
    );
  };

  renderView = () => {
    const { error, pending } = this.props;
    const { operators } = this.state;

    if (error) {
      return this.renderError();
    }

    if (pending) {
      return this.renderPendingMessage();
    }

    return (
      <TileView
        items={operators}
        itemsSorter={itemsToSort => _.sortBy(itemsToSort, 'name')}
        getAvailableCategories={determineCategories}
        getAvailableFilters={determineAvailableFilters}
        filterGroups={operatorHubFilterGroups}
        filterGroupNameMap={operatorHubFilterMap}
        keywordCompare={keywordCompare}
        renderTile={this.renderTile}
        emptyStateInfo="No operators are being shown due to the filters being applied."
      />
    );
  };

  render() {
    return (
      <div className="oh-page">
        <Header />
        <div className="oh-content">{this.renderView()}</div>
        <Footer />
      </div>
    );
  }
}

OperatorHub.propTypes = {
  operators: PropTypes.array,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  pending: PropTypes.bool,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  fetchOperators: PropTypes.func
};

OperatorHub.defaultProps = {
  operators: [],
  error: false,
  errorMessage: '',
  pending: false,
  fetchOperators: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  fetchOperators: () => dispatch(fetchOperators())
});

const mapStateToProps = state => ({
  ...state.operatorsState
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorHub);
