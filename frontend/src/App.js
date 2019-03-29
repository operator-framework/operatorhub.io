import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import { store } from './redux/store';
import { reduxConstants } from './redux';

import OperatorHub from './pages/operatorHub/OperatorHub';
import OperatorPage from './pages/operatorPage/OperatorPage';
import OperatorPreviewPage from './pages/operatorPreviewPage/OperatorPreviewPage';
import OperatorEditorPage from './pages/OperatorEditorPage/OperatorEditorPage';
import GettingStarted from './pages/documentation/GettingStarted';
import WhatIsAnOperator from './pages/documentation/WhatIsAnOperator';
import Contribute from './pages/documentation/Contribute';
import HowToInstallOperators from './pages/documentation/HowToInstallOperators';
import About from './pages/documentation/About';
import ConfirmationModal from './components/modals/ConfirmationModal';
import OperatorMetadataPage from './pages/OperatorEditorPage/OperatorMetadataPage';
import OperatorDeploymentsPage from './pages/OperatorEditorPage/OperatorDeploymentsPage';
import OperatorInstallModesPage from './pages/OperatorEditorPage/OperatorInstallModesPage';
import OperatorOwnedCRDsPage from './pages/OperatorEditorPage/OperatorOwnedCRDsPage';
import OperatorRequiredCRDsPage from './pages/OperatorEditorPage/OperatorRequiredCRDsPage';
import OperatorPermissionsPage from './pages/OperatorEditorPage/OperatorPermissionsPage';

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
          <Route path="/operator/:channel/:operatorId" component={OperatorPage} />
          <Route path="/operator/:operatorId" component={OperatorPage} />
          <Route path="/preview" component={OperatorPreviewPage} />
          <Route path="/editor/metadata" component={OperatorMetadataPage} />
          <Route path="/editor/owned-crds" component={OperatorOwnedCRDsPage} />
          <Route path="/editor/required-crds" component={OperatorRequiredCRDsPage} />
          <Route path="/editor/deployments" component={OperatorDeploymentsPage} />
          <Route path="/editor/permissions" component={OperatorPermissionsPage} />
          <Route path="/editor/install-modes" component={OperatorInstallModesPage} />
          <Route path="/editor" component={OperatorEditorPage} />
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
