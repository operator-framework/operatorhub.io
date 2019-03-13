import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import connect from 'react-redux/es/connect/connect';
import * as _ from 'lodash-es';
import queryString from 'query-string';

import { Alert, DropdownButton, EmptyState, Icon, MenuItem } from 'patternfly-react';
import { CatalogTile, FilterSidePanel } from 'patternfly-react-extensions';

import { fetchOperators } from '../../services/operatorsService';
import { helpers } from '../../common/helpers';

import Page from '../../components/Page';
import { reduxConstants } from '../../redux';
import * as operatorImg from '../../imgs/operator.svg';

const CATEGORY_URL_PARAM = 'category';
const KEYWORD_URL_PARAM = 'keyword';
const VIEW_TYPE_URL_PARAM = 'view';
const SORT_TYPE_URL_PARAM = 'sort';

const OTHER_CATEGORY = 'Other';

/**
 * Filter property white list
 */
const operatorHubFilterGroups = ['provider', 'capabilityLevel'];

const operatorHubFilterMap = {
  capabilityLevel: 'Capability Level'
};

const ignoredProviderTails = [', Inc.', ', Inc', ' Inc.', ' Inc', ', LLC', ' LLC'];

const getProviderValue = value => {
  if (!value) {
    return value;
  }

  const providerTail = _.find(ignoredProviderTails, tail => value.endsWith(tail));
  if (providerTail) {
    return value.substring(0, value.indexOf(providerTail));
  }

  return value;
};

const providerSort = provider => (provider.value || provider).toLowerCase();

const capabilityLevelSort = capabilityLevel => {
  const value = capabilityLevel.value || capabilityLevel;

  switch (value) {
    case 'Basic Install':
      return 0;
    case 'Seamless Upgrades':
      return 1;
    case 'Full Lifecycle':
      return 2;
    case 'Deep Insights':
      return 3;
    case 'Auto Pilot':
      return 4;
    default:
      return 5;
  }
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
    _.get(item, 'name', '')
      .toLowerCase()
      .includes(filterString) ||
    _.get(item, 'displayName', '')
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

const determineAvailableCategories = items => {
  const categories = {};

  _.forEach(items, item => {
    if (!_.size(item.categories)) {
      if (!categories[OTHER_CATEGORY]) {
        categories[OTHER_CATEGORY] = [];
      }
      categories[OTHER_CATEGORY].push(item);
    }
    _.forEach(item.categories, category => {
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(item);
    });
  });
  return categories;
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
            label: value || 'N/A',
            synonyms,
            value,
            active: false
          });
        }
      }
    });

    _.forEach(values, nextValue => {
      _.set(filters, [field, nextValue.value], nextValue);
    });
  });

  return filters;
};

const getActiveFilters = (groupFilters, activeFilters) => {
  _.forOwn(groupFilters, (filterValues, filterType) => {
    _.each(filterValues, filterValue => {
      _.set(activeFilters, [filterType, filterValue, 'active'], true);
    });
  });

  return activeFilters;
};

const updateActiveFilters = (activeFilters, filterType, id, value) => {
  const newFilters = _.cloneDeep(activeFilters);
  _.set(newFilters, [filterType, id, 'active'], value);

  return newFilters;
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

export const getFilterSearchParam = groupFilter => {
  const activeValues = _.reduce(
    _.keys(groupFilter),
    (result, typeKey) => (groupFilter[typeKey].active ? result.concat(typeKey) : result),
    []
  );

  return _.isEmpty(activeValues) ? '' : JSON.stringify(activeValues);
};

class OperatorHub extends React.Component {
  state = {
    filteredItems: [],
    filterCounts: null,
    filterGroupsShowAll: {},
    refreshed: false,
    filtersOpen: false,
    filterPanelHeight: 0
  };

  componentDidMount() {
    const {
      storeActiveFilters,
      storeSelectedCategory,
      storeKeywordSearch,
      storeViewType,
      storeSortType,
      activeFilters,
      selectedCategory,
      keywordSearch,
      urlSearchString,
      viewType,
      sortType
    } = this.props;
    this.refresh();

    const searchObj = queryString.parse(urlSearchString);

    const urlCategory = _.get(searchObj, CATEGORY_URL_PARAM);
    const urlKeyword = _.get(searchObj, KEYWORD_URL_PARAM);
    const urlViewType = _.get(searchObj, VIEW_TYPE_URL_PARAM);
    const urlSortType = _.get(searchObj, SORT_TYPE_URL_PARAM);

    let updatedFilters;
    const updatedCategory = urlCategory || selectedCategory;
    const updatedKeyword = urlKeyword || keywordSearch;
    const updatedViewType = urlViewType || viewType;
    const updatedSortType = urlSortType || sortType;

    if (urlCategory) {
      storeSelectedCategory(urlCategory);
    }

    if (urlKeyword || this.filtersInURL(searchObj)) {
      updatedFilters = this.getActiveValuesFromURL(searchObj, defaultFilters, operatorHubFilterGroups);
      storeActiveFilters(updatedFilters);
      storeKeywordSearch(urlKeyword || '');
    } else {
      updatedFilters = activeFilters;
    }

    if (urlViewType) {
      storeViewType(urlViewType);
    }

    if (urlSortType) {
      storeSortType(urlSortType);
    }

    this.updateURL(updatedKeyword, updatedFilters, updatedCategory, updatedViewType, updatedSortType);
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.refreshed && props.pending) {
      return { refreshed: true };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { keywordSearch, operators, activeFilters, selectedCategory, sortType, viewType } = this.props;
    const { categories, filtersOpen } = this.state;

    if (!_.isEqual(activeFilters, prevProps.activeFilters) || keywordSearch !== prevProps.keywordSearch) {
      this.updateFilteredItems(categories);
      this.updateURL(keywordSearch, activeFilters, selectedCategory, viewType, sortType);
    }

    if (!_.isEqual(operators, prevProps.operators)) {
      const updatedCategories = determineAvailableCategories(operators);
      this.updateCurrentFilters();

      if (!_.isEqual(updatedCategories, categories)) {
        this.setState({ categories: updatedCategories });
      }

      this.updateFilteredItems(updatedCategories);
    }

    if (selectedCategory !== prevProps.selectedCategory) {
      this.updateURL(keywordSearch, activeFilters, selectedCategory, viewType, sortType);
      this.updateFilteredItems(categories);
    }

    if (sortType !== prevProps.sortType) {
      this.setState({ filteredItems: this.sortItems(this.state.filteredItems) });
      this.updateURL(keywordSearch, activeFilters, selectedCategory, viewType, sortType);
    }

    if (viewType !== prevProps.viewType) {
      this.updateURL(keywordSearch, activeFilters, selectedCategory, viewType, sortType);
    }

    if (filtersOpen !== prevState.filtersOpen) {
      setTimeout(
        () => this.setState({ filterPanelHeight: this.state.filtersOpen ? this.mobileFiltersRef.offsetHeight : 0 }),
        1
      );
    }
  }

  updateCurrentFilters = () => {
    const { operators, activeFilters, storeActiveFilters } = this.props;

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

    storeActiveFilters(_.cloneDeep(newActiveFilters));
  };

  updateFilteredItems = categories => {
    const { operators, activeFilters, selectedCategory, keywordSearch } = this.props;

    if (!operators) {
      return;
    }

    const filterOperators = selectedCategory ? _.get(categories, selectedCategory) : operators;

    const filterCounts = getFilterGroupCounts(filterOperators, activeFilters);
    const filteredItems = this.sortItems(filterItems(filterOperators, keywordSearch, activeFilters));

    this.setState({ filteredItems, filterCounts });
  };

  refresh() {
    this.props.fetchOperators();
  }

  setURLParams = params => {
    const url = new URL(window.location);
    const searchParams = `?${params.toString()}`;

    this.props.history.replace(`${url.pathname}${searchParams}`);
  };

  filtersInURL = searchObj => _.some(operatorHubFilterGroups, filterGroup => _.get(searchObj, filterGroup));

  updateURL = (keywordSearch, activeFilters, selectedCategory, viewType, sortType) => {
    const params = new URLSearchParams(window.location.search);

    _.each(_.keys(activeFilters), filterType => {
      const groupFilter = activeFilters[filterType];
      const value = getFilterSearchParam(groupFilter);

      if (value) {
        params.set(filterType, Array.isArray(value) ? JSON.stringify(value) : value);
      } else {
        params.delete(filterType);
      }
    });

    if (selectedCategory) {
      params.set(CATEGORY_URL_PARAM, selectedCategory);
    } else {
      params.delete(CATEGORY_URL_PARAM);
    }

    if (keywordSearch) {
      params.set(KEYWORD_URL_PARAM, keywordSearch);
    } else {
      params.delete(KEYWORD_URL_PARAM);
    }

    if (viewType) {
      params.set(VIEW_TYPE_URL_PARAM, viewType);
    } else {
      params.delete(VIEW_TYPE_URL_PARAM);
    }

    if (sortType) {
      params.set(SORT_TYPE_URL_PARAM, sortType);
    } else {
      params.delete(SORT_TYPE_URL_PARAM);
    }

    this.setURLParams(params);
  };

  getActiveValuesFromURL = (searchObj, availableFilters, filterGroups) => {
    const groupFilters = {};

    _.each(filterGroups, filterGroup => {
      const groupFilterParam = _.get(searchObj, filterGroup);
      if (!groupFilterParam) {
        return;
      }

      try {
        _.set(groupFilters, filterGroup, JSON.parse(groupFilterParam));
      } catch (e) {
        console.warn('could not update filters from url params: could not parse search params', e);
      }
    });

    return getActiveFilters(groupFilters, availableFilters);
  };

  sortItems = items => {
    const { sortType } = this.props;
    const sortedItems = _.sortBy(items, item => item.displayName.toLowerCase());
    return sortType === 'descending' ? _.reverse(sortedItems) : sortedItems;
  };

  sortFilters = (activeFilters, groupName) => {
    let sortBy = ['value'];

    if (groupName === 'provider') {
      sortBy = providerSort;
    } else if (groupName === 'capabilityLevel') {
      sortBy = capabilityLevelSort;
    }
    return _.sortBy(_.keys(activeFilters), sortBy);
  };

  clearFilters() {
    const { activeFilters } = this.props;
    const clearedFilters = _.cloneDeep(activeFilters);

    // Clear the group filters
    _.each(operatorHubFilterGroups, field => {
      _.each(_.keys(clearedFilters[field]), key => _.set(clearedFilters, [field, key, 'active'], false));
    });

    this.props.storeActiveFilters(clearedFilters);
    this.props.storeSelectedCategory('');
    this.props.storeKeywordSearch('');
  }

  onFilterChange = (filterType, id, value) => {
    const { activeFilters } = this.props;

    const updatedFilters = updateActiveFilters(activeFilters, filterType, id, value);
    this.props.storeActiveFilters(updatedFilters);
  };

  sortCategories = categories =>
    _.keys(categories).sort((cat1, cat2) => {
      if (cat1 === OTHER_CATEGORY) {
        return 1;
      }
      if (cat2 === OTHER_CATEGORY) {
        return -1;
      }
      return cat1.localeCompare(cat2);
    });

  categorySelect = (event, selectedCategory) => {
    event.preventDefault();
    this.props.storeSelectedCategory(selectedCategory);
  };

  openDetails = (event, operator) => {
    event.preventDefault();
    this.props.history.push(`/operator/${operator.name}`);
  };

  updateViewType = viewType => {
    this.props.storeViewType(viewType);
  };

  updateSort = sortType => {
    this.props.storeSortType(sortType);
  };

  onSearchChange = searchValue => {
    const params = new URLSearchParams();

    if (searchValue) {
      params.set(KEYWORD_URL_PARAM, searchValue);
    } else {
      params.delete(KEYWORD_URL_PARAM);
    }

    this.props.storeKeywordSearch(searchValue);
  };

  clearSearch = () => {
    this.onSearchChange('');
  };

  getViewItem = viewType => (
    <span>
      <Icon type="fa" name={viewType === 'list' ? 'list' : 'th-large'} />
      {viewType}
    </span>
  );

  getSortItem = sortType => <span>{sortType === 'descending' ? 'Z-A' : 'A-Z'}</span>;

  onShowAllToggle(groupName) {
    const { filterGroupsShowAll } = this.state;
    const updatedShow = _.clone(filterGroupsShowAll);
    _.set(updatedShow, groupName, !_.get(filterGroupsShowAll, groupName, false));
    this.setState({ filterGroupsShowAll: updatedShow });
  }

  toggleFiltersOpen = () => {
    this.setState({ filtersOpen: !this.state.filtersOpen });
  };

  setMobileFiltersRef = ref => {
    this.mobileFiltersRef = ref;
  };

  renderFilterGroup = (groupName, activeFilters, filterCounts) => (
    <FilterSidePanel.Category
      key={groupName}
      title={operatorHubFilterMap[groupName] || groupName}
      onShowAllToggle={() => this.onShowAllToggle(groupName)}
      showAll={_.get(this.state.filterGroupsShowAll, groupName, false)}
    >
      {_.map(this.sortFilters(activeFilters[groupName], groupName), filterName => {
        const filter = activeFilters[groupName][filterName];
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

  renderCategories = () => {
    const { selectedCategory } = this.props;
    const { categories } = this.state;

    if (!categories) {
      return null;
    }

    return (
      <FilterSidePanel.Category key="categories" title="Categories" maxShowCount={20}>
        {_.map(this.sortCategories(categories), category => (
          <div key={category} className={`oh-category-item ${category === selectedCategory ? 'selected' : ''}`}>
            <button className="oh-category-item__select" onClick={e => this.categorySelect(e, category)}>
              {category}
            </button>
            {category === selectedCategory && (
              <button className="oh-category-item__deselect" onClick={e => this.categorySelect(e, '')}>
                <Icon type="pf" name="close" />
                <span className="sr-only">clear</span>
              </button>
            )}
          </div>
        ))}
      </FilterSidePanel.Category>
    );
  };

  renderFilters() {
    const { activeFilters } = this.props;
    const { filterCounts } = this.state;

    return (
      <FilterSidePanel>
        {this.renderCategories()}
        {_.map(operatorHubFilterGroups, groupName => this.renderFilterGroup(groupName, activeFilters, filterCounts))}
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

    const { name, displayName, imgUrl, provider, description } = item;
    const vendor = provider ? `provided by ${provider}` : null;

    return (
      <CatalogTile
        id={name}
        key={name}
        title={displayName}
        iconImg={imgUrl || operatorImg}
        vendor={vendor}
        description={description}
        href={`${window.location.origin}/operator/${name}`}
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

    const { name, displayName, imgUrl, provider, description } = item;
    const vendor = provider ? `provided by ${provider}` : null;

    return (
      <a id={name} key={name} className="oh-list-view__item" href="#" onClick={e => this.openDetails(e, item)}>
        <div className="catalog-tile-pf-header">
          <img className="catalog-tile-pf-icon" src={imgUrl || operatorImg} alt="" />
          <span>
            <div className="catalog-tile-pf-title">{displayName}</div>
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

  renderMobileFilters() {
    const { activeFilters } = this.props;
    const { filterCounts, filtersOpen, filterPanelHeight } = this.state;
    const filtersClasses = classNames('oh-hub-page__mobile-filters__filters', { open: filtersOpen });
    return (
      <div className="oh-hub-page__mobile-filters">
        <div className="oh-hub-page__mobile-filters__toolbar">
          <button className="oh-filter-toggle" type="button" onClick={this.toggleFiltersOpen}>
            <Icon className="oh-filter-icon" type="pf" name={filtersOpen ? 'close' : 'filter'} />
            <span>Filters</span>
          </button>
        </div>
        <div className={filtersClasses} style={{ height: filterPanelHeight }}>
          <div className="oh-hub-page__mobile-filters__filters__inner" ref={this.setMobileFiltersRef}>
            {this.renderCategories()}
            {_.map(operatorHubFilterGroups, groupName =>
              this.renderFilterGroup(groupName, activeFilters, filterCounts)
            )}
          </div>
        </div>
      </div>
    );
  }

  renderToolbar() {
    const { viewType, sortType } = this.props;
    const { filteredItems } = this.state;

    return (
      <div className="oh-hub-page__toolbar">
        <div className="oh-hub-page__toolbar__item oh-hub-page__toolbar__item-left">
          {filteredItems.length}
          <span className="oh-hub-page__toolbar__label oh-tiny">ITEMS</span>
        </div>
        <div className="oh-hub-page__toolbar__item">
          <span className="oh-hub-page__toolbar__label oh-tiny">VIEW</span>
          <DropdownButton
            className="oh-hub-page__toolbar__dropdown"
            title={this.getViewItem(viewType)}
            id="view-type-dropdown"
            pullRight
          >
            <MenuItem eventKey={0} active={viewType !== 'list'} onClick={() => this.updateViewType('card')}>
              {this.getViewItem('card')}
            </MenuItem>
            <MenuItem eventKey={0} active={viewType === 'list'} onClick={() => this.updateViewType('list')}>
              {this.getViewItem('list')}
            </MenuItem>
          </DropdownButton>
        </div>
        <div className="oh-hub-page__toolbar__item">
          <span className="oh-hub-page__toolbar__label oh-tiny">SORT</span>
          <DropdownButton
            className="oh-hub-page__toolbar__dropdown"
            title={this.getSortItem(sortType)}
            id="view-type-dropdown"
            pullRight
          >
            <MenuItem eventKey={0} active={sortType !== 'descending'} onClick={() => this.updateSort('ascending')}>
              {this.getSortItem('ascending')}
            </MenuItem>
            <MenuItem eventKey={0} active={sortType === 'descending'} onClick={() => this.updateSort('descending')}>
              {this.getSortItem('descending')}
            </MenuItem>
          </DropdownButton>
        </div>
      </div>
    );
  }

  renderView = () => {
    const { error, pending, operators, viewType } = this.props;

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
          {this.renderMobileFilters()}
          {this.renderToolbar()}
          {viewType !== 'list' ? this.renderCards() : this.renderListItems()}
        </div>
      </div>
    );
  };

  render() {
    const { keywordSearch, history, pending } = this.props;
    const { refreshed } = this.state;

    const headerContent = (
      <div className="oh-hub-header-content">
        <h1 className="oh-hero">Welcome to OperatorHub.io</h1>
        <p className="oh-header-content__sub-title">
          OperatorHub.io is a new home for the Kubernetes community to share Operators. Find an existing Operator or
          list your own today.
        </p>
      </div>
    );

    return (
      <Page
        headerContent={headerContent}
        history={history}
        onSearchChange={this.onSearchChange}
        clearSearch={this.clearSearch}
        searchValue={keywordSearch}
        showFooter={refreshed && !pending}
        homePage
      >
        {this.renderView()}
      </Page>
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
  fetchOperators: PropTypes.func,
  urlSearchString: PropTypes.string,
  viewType: PropTypes.string,
  activeFilters: PropTypes.object,
  selectedCategory: PropTypes.string,
  keywordSearch: PropTypes.string,
  sortType: PropTypes.string,
  storeActiveFilters: PropTypes.func,
  storeSelectedCategory: PropTypes.func,
  storeKeywordSearch: PropTypes.func,
  storeSortType: PropTypes.func,
  storeViewType: PropTypes.func
};

OperatorHub.defaultProps = {
  operators: [],
  error: false,
  errorMessage: '',
  pending: false,
  fetchOperators: helpers.noop,
  activeFilters: [],
  selectedCategory: '',
  keywordSearch: '',
  urlSearchString: '',
  viewType: '',
  sortType: '',
  storeActiveFilters: helpers.noop,
  storeSelectedCategory: helpers.noop,
  storeKeywordSearch: helpers.noop,
  storeSortType: helpers.noop,
  storeViewType: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  fetchOperators: () => dispatch(fetchOperators()),
  storeActiveFilters: activeFilters =>
    dispatch({
      type: reduxConstants.SET_ACTIVE_FILTERS,
      activeFilters
    }),
  storeSelectedCategory: selectedCategory =>
    dispatch({
      type: reduxConstants.SET_SELECTED_CATEGORY,
      selectedCategory
    }),
  storeKeywordSearch: keywordSearch =>
    dispatch({
      type: reduxConstants.SET_KEYWORD_SEARCH,
      keywordSearch
    }),
  storeSortType: sortType =>
    dispatch({
      type: reduxConstants.SET_SORT_TYPE,
      sortType
    }),
  storeViewType: viewType =>
    dispatch({
      type: reduxConstants.SET_VIEW_TYPE,
      viewType
    })
});

const mapStateToProps = state => ({
  ...state.operatorsState,
  ...state.viewState
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorHub);
