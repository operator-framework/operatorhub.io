import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import OperatorHub from './pages/operatorHub/OperatorHub';
import OperatorPage from './pages/operatorPage/OperatorPage';

class App extends React.Component {
  navigateTo = path => {
    const { history } = this.props;

    history.push(path);
  };

  render() {
    return (
      <Switch>
        <Route path="/:operatorId" component={OperatorPage} />
        <Route path="/" exact component={OperatorHub} />
        <Redirect from="*" to="/" key="default-route" />
      </Switch>
    );
  }
}

App.propTypes = {
  history: PropTypes.object.isRequired
};

export default withRouter(App);
