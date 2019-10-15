import { reduxConstants } from '../constants';


  export const storeKeywordSearchAction = (keywordSearch: string) =>
  ({
    type: reduxConstants.SET_KEYWORD_SEARCH,
    keywordSearch
  });