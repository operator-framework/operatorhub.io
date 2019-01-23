import * as React from 'react';
import * as _ from 'lodash-es';
import * as PropTypes from 'prop-types';
import { FilterSidePanel } from 'patternfly-react-extensions';
import { EmptyState } from 'patternfly-react';

const filterByGroup = (items, filters) =>
  // Filter items by each filter group
  _.reduce(
    filters,
    (filtered, group, key) => {
      // Only apply active filters
      const activeFilters = _.filter(group, 'active');
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

const filterItems = (items, filters) => {
  if (_.isEmpty(filters)) {
    return items;
  }

  // Apply each filter property individually. Example:
  //  filteredByGroup = {
  //    provider: [/*array of items filtered by provider*/],
  //    healthIndex: [/*array of items filtered by healthIndex*/],
  //  };
  const filteredByGroup = filterByGroup(items, filters);

  return [..._.values(filteredByGroup), items].reduce((a, b) => a.filter(c => b.includes(c)));
};

const determineAvailableFilters = (initialFilters, items, filterGroups) => {
  const filters = _.cloneDeep(initialFilters);

  _.each(filterGroups, field => {
    _.each(items, item => {
      const value = item[field];
      if (value) {
        _.set(filters, [field, value], {
          label: value,
          value,
          active: false
        });
      }
    });
  });

  return filters;
};

export const updateActiveFilters = (activeFilters, filterType, id, value) => {
  _.set(activeFilters, [filterType, id, 'active'], value);

  return activeFilters;
};

const clearActiveFilters = (activeFilters, filterGroups) => {
  // Clear the group filters
  _.each(filterGroups, field => {
    _.each(_.keys(activeFilters[field]), key => _.set(activeFilters, [field, key, 'active'], false));
  });

  return activeFilters;
};

const getFilterGroupCounts = (items, filterGroups, filters) => {
  const newFilterCounts = {};

  _.each(filterGroups, filterGroup => {
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

export default class TileView extends React.Component {
  constructor(props) {
    super(props);
    const { items } = this.props;

    this.state = {
      activeFilters: defaultFilters,
      filteredItems: items,
      filterCounts: null
    };

    this.onFilterChange = this.onFilterChange.bind(this);
    this.renderFilterGroup = this.renderFilterGroup.bind(this);
  }

  componentDidMount() {
    const { items, filterGroups, getAvailableFilters } = this.props;
    const availableFilters = getAvailableFilters(defaultFilters, items, filterGroups);

    if (_.size(items)) {
      this.setState({
        ...this.getUpdatedState(availableFilters)
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { activeFilters } = this.state;
    const { items, filterGroups, getAvailableFilters } = this.props;

    if (!_.isEqual(items, prevProps.items)) {
      const availableFilters = getAvailableFilters(defaultFilters, items, filterGroups);

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

      this.setState({
        ...this.getUpdatedState(newActiveFilters)
      });
    }
  }

  getUpdatedState(activeFilters) {
    const { items, filterGroups } = this.props;

    if (!items) {
      return null;
    }

    const filteredItems = filterItems(items, activeFilters);

    return {
      activeFilters,
      filteredItems,
      filterCounts: getFilterGroupCounts(items, filterGroups, activeFilters)
    };
  }

  clearFilters() {
    const { filterGroups } = this.props;
    const { activeFilters } = this.state;

    const clearedFilters = clearActiveFilters(activeFilters, filterGroups);

    this.setState(this.getUpdatedState(clearedFilters));
  }

  onFilterChange(filterType, id, value) {
    const { activeFilters } = this.state;

    const updatedFilters = updateActiveFilters(activeFilters, filterType, id, value);

    this.setState(this.getUpdatedState(updatedFilters));
  }

  renderFilterGroup(filterGroup, groupName, activeFilters, filterCounts) {
    const { filterGroupNameMap } = this.props;

    return (
      <FilterSidePanel.Category key={groupName} title={filterGroupNameMap[groupName] || groupName}>
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
  }

  renderFilters() {
    let { renderFilterGroup } = this.props;
    const { activeFilters, filterCounts } = this.state;

    renderFilterGroup = renderFilterGroup || this.renderFilterGroup;

    return (
      <FilterSidePanel>
        {_.map(activeFilters, (filterGroup, groupName) =>
          renderFilterGroup(filterGroup, groupName, activeFilters, filterCounts)
        )}
      </FilterSidePanel>
    );
  }

  renderEmptyState() {
    const { emptyStateTitle, emptyStateInfo } = this.props;
    return (
      <EmptyState className="co-catalog-page__no-filter-results">
        <EmptyState.Title className="co-catalog-page__no-filter-results-title" aria-level="2">
          {emptyStateTitle}
        </EmptyState.Title>
        <EmptyState.Info className="text-secondary">{emptyStateInfo}</EmptyState.Info>
        <EmptyState.Help>
          <button type="button" className="btn btn-link" onClick={() => this.clearFilters()}>
            Clear All Filters
          </button>
        </EmptyState.Help>
      </EmptyState>
    );
  }

  render() {
    const { renderTile } = this.props;
    const { filteredItems } = this.state;

    return (
      <div className="oh-tile-view">
        <div className="oh-tile-view__filters">{this.renderFilters()}</div>
        <div className="oh-tile-view__content">
          <div className="oh-tile-view__num-items">{filteredItems.length} items</div>
          {_.size(filteredItems) && (
            <div className="catalog-tile-view-pf catalog-tile-view-pf-no-categories">
              {_.map(filteredItems, item => renderTile(item))}
            </div>
          )}
          {_.size(filteredItems) === 0 && this.renderEmptyState()}
        </div>
      </div>
    );
  }
}

TileView.displayName = 'TileViewPage';

TileView.propTypes = {
  items: PropTypes.array,
  itemsSorter: PropTypes.func.isRequired,
  getAvailableFilters: PropTypes.func,
  filterGroups: PropTypes.array.isRequired,
  filterGroupNameMap: PropTypes.object,
  renderFilterGroup: PropTypes.func,
  renderTile: PropTypes.func.isRequired,
  emptyStateTitle: PropTypes.string,
  emptyStateInfo: PropTypes.string
};

TileView.defaultProps = {
  items: null,
  getAvailableFilters: determineAvailableFilters,
  filterGroupNameMap: {},
  renderFilterGroup: null,
  emptyStateTitle: 'No Results Match the Filter Criteria',
  emptyStateInfo: 'No items are being shown due to the filters being applied.'
};
