import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import { store } from './redux/store';
import { reduxConstants } from './redux';

import OperatorHub from './pages/operatorHub/OperatorHub';
import OperatorPage from './pages/operatorPage/OperatorPage';
import GettingStarted from './pages/gettingStarted/GettingStarted';
import WhatIsAnOperator from './pages/whatIsAnOperator/WhatIsAnOperator';
import Contribute from './pages/contribute/Contribute';
import About from './pages/about/About';

class App extends React.Component {
  constructor(props) {
    super(props);

    store.dispatch({
      type: reduxConstants.SET_URL_SEARCH_STRING,
      urlSearchString: props.location.search
    });
  }

  render() {
    return (
      <Switch>
        <Route path="/operator" component={OperatorPage} />
        <Route path="/getting-started-with-operators" component={GettingStarted} />
        <Route path="/what-is-an-operator" component={WhatIsAnOperator} />
        <Route path="/contribute" component={Contribute} />
        <Route path="/about" component={About} />
        <Route path="/" component={OperatorHub} />
        <Redirect from="*" to="/" key="default-route" />
      </Switch>
    );
  }
}

App.propTypes = {
  location: PropTypes.object.isRequired
};

export default withRouter(App);
