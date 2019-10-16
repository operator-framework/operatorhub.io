import { reduxConstants } from '../constants';


export const storeKeywordSearchAction = (keywordSearch: string) =>
  ({
    type: reduxConstants.SET_KEYWORD_SEARCH,
    keywordSearch
  });

export const storeActiveFiltersAction = (activeFilters) =>
  ({
    type: reduxConstants.SET_ACTIVE_FILTERS,
    activeFilters
  });

export const storeSelectedCategoryAction = (selectedCategory: string) =>
  ({
    type: reduxConstants.SET_SELECTED_CATEGORY,
    selectedCategory
  });

export const storeSortType = (sortType: 'ascending' | 'descending') =>
  ({
    type: reduxConstants.SET_SORT_TYPE,
    sortType
  });

  export const storeViewType = (viewType: 'list' | 'card') =>
  ({
    type: reduxConstants.SET_VIEW_TYPE,
    viewType
  })