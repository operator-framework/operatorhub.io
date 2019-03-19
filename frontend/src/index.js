import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Prompt } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';
import './style.scss';

const getUserConfirmation = (message, confirmCallback) => {
  console.log(message);
  confirmCallback(1 === 0);
};

ReactDOM.render(
  <Provider store={store}>
    <Router get getUserConfirmation={getUserConfirmation}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);

navigator.serviceWorker
  .getRegistrations()
  .then(registrations => registrations.forEach(reg => reg.unregister()))
  .catch(e => console.warn('Error unregistering service workers', e));
