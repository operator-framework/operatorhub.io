import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import connect from 'react-redux/es/connect/connect';
import * as _ from 'lodash-es';

import { Alert, DropdownButton, EmptyState, Icon, MenuItem } from 'patternfly-react';
import { CatalogTile, FilterSidePanel } from 'patternfly-react-extensions';

import { fetchOperators } from '../../services/operatorsService';
import { helpers } from '../../common/helpers';

import Footer from '../../components/Footer';
import { HubHeader } from './HubHeader';

/**
 * Filter property white list
 */
const operatorHubFilterGroups = ['provider', 'maturity'];

const operatorHubFilterMap = {
  maturity: 'Operator Maturity'
};

const ignoredProviderTails = [', Inc.', ', Inc', ' Inc.', ' Inc', ', LLC', ' LLC'];

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

const sortFilterValues = (values, field) => {
  let sorter = ['value'];

  if (field === 'provider') {
    sorter = providerSort;
  }

  return _.sortBy(values, sorter);
};

const filterByGroup = (items, filters) =>
  // Filter items by each filter group
  _.reduce(
    filters,
    (filtered, group, key) => {
      // Only apply active filters
      const activeFilters = _.filter(group, filter => filter.active);
      if (activeFilters.length) {
        const values = _.reduce(
          activeFilters,
          (filterValues, filter) => {
            filterValues.push(filter.value, ..._.get(filter, 'synonyms', []));
            return filterValues;
          },
          []
        );

        filtered[key] = _.filter(items, item => values.includes(item[key]));
      }

      return filtered;
    },
    {}
  );

const keywordCompare = (filterString, item) => {
  if (!filterString) {
    return true;
  }
  if (!item) {
    return false;
  }

  return (
    _.get(item, 'obj.metadata.name', '')
      .toLowerCase()
      .includes(filterString) ||
    _.get(item, 'displayName', '')
      .toLowerCase()
      .includes(filterString) ||
    _.get(item, 'categories', '')
      .toLowerCase()
      .includes(filterString)
  );
};

const filterByKeyword = (items, keyword) => {
  if (!keyword) {
    return items;
  }

  const filterString = keyword.toLowerCase();
  return _.filter(items, item => keywordCompare(filterString, item));
};

const filterItems = (items, keyword, filters) => {
  const filteredByKeyword = filterByKeyword(items, keyword);

  if (_.isEmpty(filters)) {
    return filteredByKeyword;
  }

  // Apply each filter property individually. Example:
  //  filteredByGroup = {
  //    provider: [/*array of items filtered by provider*/],
  //    healthIndex: [/*array of items filtered by healthIndex*/],
  //  };
  const filteredByGroup = filterByGroup(filteredByKeyword, filters);

  // Intersection of individually applied filters is all filters
  // In the case no filters are active, returns items filteredByKeyword
  return [..._.values(filteredByGroup), filteredByKeyword].reduce((a, b) => a.filter(c => b.includes(c)));
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

export const updateActiveFilters = (activeFilters, filterType, id, value) => {
  _.set(activeFilters, [filterType, id, 'active'], value);

  return activeFilters;
};

const getFilterGroupCounts = (items, filters) => {
  const newFilterCounts = {};

  _.each(operatorHubFilterGroups, filterGroup => {
    _.each(_.keys(filters[filterGroup]), key => {
      const filterValues = [
        _.get(filters, [filterGroup, key, 'value']),
        ..._.get(filters, [filterGroup, key, 'synonyms'], [])
      ];

      const matchedItems = _.filter(items, item => filterValues.includes(item[filterGroup]));

      _.set(newFilterCounts, [filterGroup, key], _.size(matchedItems));
    });
  });

  return newFilterCounts;
};

const defaultFilters = {};

class OperatorHub extends React.Component {
  state = {
    operators: [],
    activeFilters: defaultFilters,
    filteredItems: [],
    filterCounts: null,
    viewType: 'card',
    sortType: 'ascending',
    keywordFilter: ''
  };

  componentDidMount() {
    this.updateNewOperators(this.props.operators);
    this.refresh();

    const searchParams = new URLSearchParams(window.location.search);
    const keywordSearch = searchParams.get('search') || '';
    this.setState({ keywordFilter: keywordSearch });
  }

  componentDidUpdate(prevProps, prevState) {
    const { operators } = this.props;

    if (this.state.keywordFilter !== prevState.keywordFilter || !_.isEqual(operators, prevProps.operators)) {
      this.updateNewOperators(operators);
    }
    if (this.state.sortType !== prevState.sortType) {
      this.setState({ filteredItems: _.reverse(this.state.filteredItems) });
    }
  }

  updateNewOperators = operators => {
    const { activeFilters, keywordFilter } = this.state;
    const availableFilters = determineAvailableFilters(defaultFilters, operators, operatorHubFilterGroups);

    const newActiveFilters = _.reduce(
      availableFilters,
      (updatedFilters, filterGroup, filterGroupName) => {
        _.each(filterGroup, (filterItem, filterItemName) => {
          updatedFilters[filterGroupName][filterItemName].active = _.get(
            activeFilters,
            [filterGroupName, filterItemName, 'active'],
            false
          );
        });

        return updatedFilters;
      },
      availableFilters
    );

    const filterCounts = getFilterGroupCounts(operators, newActiveFilters);
    const filteredItems = this.sortItems(filterItems(operators, keywordFilter, newActiveFilters));
    this.setState({
      operators,
      filteredItems,
      activeFilters: newActiveFilters,
      filterCounts
    });
  };

  refresh() {
    this.props.fetchOperators();
  }

  sortItems = items => {
    const { sortType } = this.state;
    const sortedItems = _.sortBy(items, item => item.name.toLowerCase());
    return sortType === 'ascending' ? sortedItems : _.reverse(sortedItems);
  };

  clearActiveFilters = activeFilters => {
    this.clearSearch();
    // Clear the group filters
    _.each(operatorHubFilterGroups, field => {
      _.each(_.keys(activeFilters[field]), key => _.set(activeFilters, [field, key, 'active'], false));
    });

    return activeFilters;
  };

  clearFilters() {
    const { operators, activeFilters } = this.state;

    const clearedFilters = this.clearActiveFilters(activeFilters);
    const filteredItems = this.sortItems(filterItems(operators, '', activeFilters));

    this.setState({ filteredItems, activeFilters: clearedFilters });
  }

  onFilterChange = (filterType, id, value) => {
    const { operators, activeFilters, keywordFilter } = this.state;

    const updatedFilters = updateActiveFilters(activeFilters, filterType, id, value);
    const filteredItems = this.sortItems(filterItems(operators, keywordFilter, activeFilters));

    this.setState({ filteredItems, activeFilters: updatedFilters });
  };

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

  onHeaderWheel = wheelEvent => {
    this.scrollRef.scrollTop -= _.get(wheelEvent, 'nativeEvent.wheelDelta', 0);
  };

  setScrollRef = ref => {
    this.scrollRef = ref;
  };

  setHeaderRef = ref => {
    this.headerRef = ref;
  };

  setTopBarRef = ref => {
    this.topBarRef = ref;
  };

  openDetails = (event, operator) => {
    event.preventDefault();
    this.props.history.push(`/${operator.name}`);
  };

  updateViewType = viewType => {
    this.setState({ viewType });
  };

  updateSort = sortType => {
    this.setState({ sortType });
  };

  onSearch = searchValue => {
    const { history } = this.props;
    const { location } = window;
    const url = new URL(location);
    const params = new URLSearchParams();

    if (searchValue) {
      params.set('search', searchValue);
    }

    const searchParams = `?${params.toString()}${url.hash}`;
    history.replace(`${url.pathname}${searchParams}`);

    this.setState({ keywordFilter: searchValue });
  };

  clearSearch = () => {
    this.onSearch('');
  };

  getViewItem = viewType => (
    <span>
      <Icon type="fa" name={viewType === 'card' ? 'th-large' : 'list'} />
      {viewType}
    </span>
  );

  getSortItem = sortType => <span>{sortType === 'ascending' ? 'A-Z' : 'Z-A'}</span>;

  renderFilterGroup = (filterGroup, groupName, activeFilters, filterCounts) => (
    <FilterSidePanel.Category key={groupName} title={operatorHubFilterMap[groupName] || groupName}>
      {_.map(filterGroup, (filter, filterName) => {
        const { label, active } = filter;
        return (
          <FilterSidePanel.CategoryItem
            key={filterName}
            count={_.get(filterCounts, [groupName, filterName], 0)}
            checked={active}
            onChange={e => this.onFilterChange(groupName, filterName, e.target.checked)}
            title={label}
          >
            {label}
          </FilterSidePanel.CategoryItem>
        );
      })}
    </FilterSidePanel.Category>
  );

  renderFilters() {
    const { activeFilters, filterCounts } = this.state;

    return (
      <FilterSidePanel>
        {_.map(activeFilters, (filterGroup, groupName) =>
          this.renderFilterGroup(filterGroup, groupName, activeFilters, filterCounts)
        )}
      </FilterSidePanel>
    );
  }

  renderPendingMessage = () => (
    <EmptyState className="blank-slate-content-pf">
      <div className="loading-state-pf loading-state-pf-lg">
        <div className="spinner spinner-lg" />
        Loading available operators
      </div>
    </EmptyState>
  );

  renderError = () => {
    const { errorMessage } = this.props;

    return (
      <EmptyState className="blank-slate-content-pf">
        <Alert type="error">
          <span>Error retrieving operators: {errorMessage}</span>
        </Alert>
      </EmptyState>
    );
  };

  renderFilteredEmptyState() {
    return (
      <EmptyState className="blank-slate-content-pf">
        <EmptyState.Title className="oh-no-filter-results-title" aria-level="2">
          No Results Match the Filter Criteria
        </EmptyState.Title>
        <EmptyState.Info className="text-secondary">
          No operators are being shown due to the filters being applied.
        </EmptyState.Info>
        <EmptyState.Help>
          <button type="button" className="btn btn-link" onClick={() => this.clearFilters()}>
            Clear All Filters
          </button>
        </EmptyState.Help>
      </EmptyState>
    );
  }

  renderCard = item => {
    if (!item) {
      return null;
    }

    const { name, imgUrl, provider, description, longDescription } = item;
    const vendor = provider ? `provided by ${provider}` : null;

    return (
      <CatalogTile
        id={name}
        key={name}
        title={name}
        iconImg={imgUrl}
        vendor={vendor}
        description={description || longDescription}
        onClick={e => this.openDetails(e, item)}
      />
    );
  };

  renderCards() {
    const { filteredItems } = this.state;

    if (!_.size(filteredItems)) {
      return this.renderFilteredEmptyState();
    }

    return (
      <div className="catalog-tile-view-pf catalog-tile-view-pf-no-categories">
        {_.map(filteredItems, item => this.renderCard(item))}
      </div>
    );
  }

  renderListItem = item => {
    if (!item) {
      return null;
    }

    const { name, imgUrl, provider, description } = item;
    const vendor = provider ? `provided by ${provider}` : null;

    return (
      <a id={name} key={name} className="oh-list-view__item" href="#" onClick={e => this.openDetails(e, item)}>
        <div className="catalog-tile-pf-header">
          <img className="catalog-tile-pf-icon" src={imgUrl} alt="" />
          <span>
            <div className="catalog-tile-pf-title">{name}</div>
            <div className="catalog-tile-pf-subtitle">{vendor}</div>
          </span>
        </div>
        <div className="catalog-tile-pf-description">
          <span>{description}</span>
        </div>
      </a>
    );
  };

  renderListItems() {
    const { filteredItems } = this.state;

    if (!_.size(filteredItems)) {
      return this.renderFilteredEmptyState();
    }

    return <div className="oh-list-view">{_.map(filteredItems, item => this.renderListItem(item))}</div>;
  }

  renderView = () => {
    const { error, pending } = this.props;
    const { operators, filteredItems, viewType, sortType } = this.state;

    if (error) {
      return this.renderError();
    }

    if (pending) {
      return this.renderPendingMessage();
    }

    if (!_.size(operators)) {
      return (
        <EmptyState className="blank-slate-content-pf">
          <EmptyState.Title className="oh-no-filter-results-title" aria-level="2">
            No Community Operators Exist
          </EmptyState.Title>
          <EmptyState.Info className="text-secondary">
            No community operators were found, refresh the page to try again.
          </EmptyState.Info>
        </EmptyState>
      );
    }

    return (
      <div className="oh-hub-page">
        <div className="oh-hub-page__filters">{this.renderFilters()}</div>
        <div className="oh-hub-page__content">
          <div className="oh-hub-page__toolbar">
            <div className="oh-hub-page__toolbar__item oh-hub-page__toolbar__item-left">
              {filteredItems.length}
              <span className="oh-hub-page__toolbar__label">items</span>
            </div>
            <div className="oh-hub-page__toolbar__item">
              <span className="oh-hub-page__toolbar__label">VIEW:</span>
              <DropdownButton
                className="oh-hub-page__toolbar__dropdown"
                title={this.getViewItem(viewType)}
                id="view-type-dropdown"
                pullRight
              >
                <MenuItem eventKey={0} active={viewType === 'card'} onClick={() => this.updateViewType('card')}>
                  {this.getViewItem('card')}
                </MenuItem>
                <MenuItem eventKey={0} active={viewType === 'list'} onClick={() => this.updateViewType('list')}>
                  {this.getViewItem('list')}
                </MenuItem>
              </DropdownButton>
            </div>
            <div className="oh-hub-page__toolbar__item">
              <span className="oh-hub-page__toolbar__label">SORT:</span>
              <DropdownButton
                className="oh-hub-page__toolbar__dropdown"
                title={this.getSortItem(sortType)}
                id="view-type-dropdown"
                pullRight
              >
                <MenuItem eventKey={0} active={sortType === 'ascending'} onClick={() => this.updateSort('ascending')}>
                  {this.getSortItem('ascending')}
                </MenuItem>
                <MenuItem eventKey={0} active={sortType === 'descending'} onClick={() => this.updateSort('descending')}>
                  {this.getSortItem('descending')}
                </MenuItem>
              </DropdownButton>
            </div>
          </div>
          {viewType === 'card' && this.renderCards()}
          {viewType !== 'card' && this.renderListItems()}
        </div>
      </div>
    );
  };

  render() {
    const { fixedHeader, scrollTop, headerHeight, keywordFilter } = this.state;
    const headStyle = fixedHeader ? { top: scrollTop || 0 } : null;
    const contentStyle = fixedHeader ? { marginTop: headerHeight || 0 } : null;
    const pageClasses = classNames('oh-page', { 'oh-page-fixed-header': fixedHeader });

    return (
      <div className="content-scrollable" onScroll={this.contentScrolled} ref={this.setScrollRef}>
        <div className={pageClasses}>
          <div className="oh-page__content">
            <HubHeader
              style={headStyle}
              onWheel={e => {
                this.onHeaderWheel(e);
              }}
              searchCallback={this.onSearch}
              clearSearch={this.clearSearch}
              searchValue={keywordFilter}
              headerRef={this.setHeaderRef}
              topBarRef={this.setTopBarRef}
            />
            <div className="oh-content oh-content-hub" style={contentStyle}>
              {this.renderView()}
            </div>
            <Footer />
          </div>
        </div>
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
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired
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
