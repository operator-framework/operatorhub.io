import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';
import './style.scss';

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);

navigator.serviceWorker
  .getRegistrations()
  .then(registrations => registrations.forEach(reg => reg.unregister()))
  .catch(e => console.warn('Error unregistering service workers', e));
