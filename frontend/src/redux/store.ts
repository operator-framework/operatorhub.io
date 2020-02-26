import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { autoSaveEditor } from './editorAutosave';
import { createRootReducer } from './rootReducer';

const history = createBrowserHistory();

// @ts-ignore
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  createRootReducer(history),
  composeEnhancer(
    applyMiddleware(
      routerMiddleware(history),
      thunkMiddleware
    )
  )
);

store.subscribe(autoSaveEditor);

window.onbeforeunload = e => {
  const state = store.getState();
  if (state.editorState.operatorModified) {
    e.preventDefault();
    e.returnValue = '';
  }
};

export { store as default, history };
