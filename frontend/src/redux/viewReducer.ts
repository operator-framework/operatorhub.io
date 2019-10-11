import { reduxConstants } from './constants';

export interface ViewReducerState{
  activeFilters: Record<string, any>,
  selectedCategory: string,
  keywordSearch: string,
  urlSearchString: string,
  sortType: string,
  viewType: string
}

const initialState: ViewReducerState = {
  activeFilters: {},
  selectedCategory: '',
  keywordSearch: '',
  urlSearchString: '',
  sortType: '',
  viewType: ''
};

const viewReducer = (state: ViewReducerState = initialState, action) => {
  switch (action.type) {
    case reduxConstants.SET_ACTIVE_FILTERS:
      return { 
        ...state,
        activeFilters: action.activeFilters 
      };

    case reduxConstants.SET_SELECTED_CATEGORY:
      return { 
        ...state,
        selectedCategory: action.selectedCategory 
      };

    case reduxConstants.SET_KEYWORD_SEARCH:
      return { 
        ...state,
        keywordSearch: action.keywordSearch 
      };

    case reduxConstants.SET_SORT_TYPE:
      return { 
        ...state,
        sortType: action.sortType 
      };

    case reduxConstants.SET_VIEW_TYPE:
      return { 
        ...state,
        viewType: action.viewType 
      };

    case reduxConstants.SET_URL_SEARCH_STRING:
      return { 
        ...state,
        urlSearchString: action.urlSearchString 
      };

    default:
      return state;
  }
};

viewReducer.initialState = initialState;

export { initialState, viewReducer };
