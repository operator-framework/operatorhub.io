import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import { store } from './redux/store';
import { reduxConstants } from './redux';

import OperatorHub from './pages/operatorHub/OperatorHub';
import OperatorPage from './pages/operatorPage/OperatorPage';
import GettingStarted from './pages/gettingStarted/GettingStarted';

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
        <Route path="/operator/:operatorId" component={OperatorPage} />
        <Route path="/getting-started-with-operators" component={GettingStarted} />
        <Route path="/" component={OperatorHub} />
        <Redirect from="*" to="/" key="default-route" />
      </Switch>
    );
  }
}

App.propTypes = {
  location: PropTypes.object.isRequired,
};

export default withRouter(App);
