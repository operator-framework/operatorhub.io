import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { reduxReducers } from './index';
import { autoSaveEditor } from './editorAutosave';

const history = createBrowserHistory();
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  connectRouter(history)(reduxReducers),
  composeEnhancer(applyMiddleware(routerMiddleware(history), thunkMiddleware, promiseMiddleware()))
);

const reloadReducers = () => {
  store.replaceReducer(connectRouter(history)(reduxReducers));
};

store.subscribe(autoSaveEditor);

window.onbeforeunload = e => {
  const state = store.getState();
  if (state.editorState.operatorModified) {
    e.preventDefault();
    e.returnValue = '';
  }
};

export { store as default, reloadReducers };
