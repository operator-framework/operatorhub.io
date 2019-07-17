import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import { store } from './redux/store';
import { reduxConstants } from './redux';

import OperatorHub from './pages/operatorHub/OperatorHub';
import ConfirmationModal from './components/ConfirmationModal';
import asyncComponent from './common/AsyncComponent';

const OperatorPage = asyncComponent(() =>
  import(/* webpackChunkName: "OperatorPage" */ './pages/operatorPage/OperatorPage').then(module => module.default)
);
const OperatorPreviewPage = asyncComponent(() =>
  import(/* webpackChunkName: "OperatorPreviewPage" */ './pages/operatorPreviewPage/OperatorPreviewPage').then(
    module => module.default
  )
);
const GettingStarted = asyncComponent(() =>
  import(/* webpackChunkName: "GettingStarted" */ './pages/documentation/GettingStarted').then(module => module.default)
);
const WhatIsAnOperator = asyncComponent(() =>
  import(/* webpackChunkName: "WhatIsAnOperator" */ './pages/documentation/WhatIsAnOperator').then(
    module => module.default
  )
);
const Contribute = asyncComponent(() =>
  import(/* webpackChunkName: "Contribute" */ './pages/documentation/Contribute').then(module => module.default)
);
const HowToInstallOperators = asyncComponent(() =>
  import(/* webpackChunkName: "HowToInstallOperators" */ './pages/documentation/HowToInstallOperators').then(
    module => module.default
  )
);
const About = asyncComponent(() =>
  import(/* webpackChunkName: "About" */ './pages/documentation/About').then(module => module.default)
);


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
      <React.Fragment>
        <Switch>
          <Route path="/operator/:packageName/:channel/:operatorId" component={OperatorPage} />
          <Route path="/operator/:channel/:operatorId" component={OperatorPage} />
          <Route path="/operator/:packageName" component={OperatorPage} />
          <Route path="/preview" component={OperatorPreviewPage} />
          <Route path="/getting-started" component={GettingStarted} />
          <Route path="/what-is-an-operator" component={WhatIsAnOperator} />
          <Route path="/contribute" component={Contribute} />
          <Route path="/how-to-install-an-operator" component={HowToInstallOperators} />
          <Route path="/about" component={About} />
          <Route path="/" component={OperatorHub} />
          <Redirect from="*" to="/" key="default-route" />
        </Switch>
        <ConfirmationModal key="confirmationModal" />
      </React.Fragment>
    );
  }
}

App.propTypes = {
  location: PropTypes.object.isRequired
};

export default withRouter(App);
