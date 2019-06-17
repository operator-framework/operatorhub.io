import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import store from './redux/store';
import { reduxConstants } from './redux';

import OperatorHub from './pages/operatorHub/OperatorHub';
import OperatorPage from './pages/operatorPage/OperatorPage';
import OperatorPreviewPage from './pages/operatorPreviewPage/OperatorPreviewPage';
import OperatorBundlePage from './pages/operatorBundlePage/OperatorBundlePage';
import OperatorYamlEditorPage from './pages/operatorBundlePage/OperatorYamlEditorPage';
import GettingStarted from './pages/documentation/GettingStarted';
import WhatIsAnOperator from './pages/documentation/WhatIsAnOperator';
import Contribute from './pages/documentation/Contribute';
import HowToInstallOperators from './pages/documentation/HowToInstallOperators';
import About from './pages/documentation/About';
import ConfirmationModal from './components/modals/ConfirmationModal';
import OperatorMetadataPage from './pages/operatorBundlePage/OperatorMetadataPage';
import OperatorDeploymentsPage from './pages/operatorBundlePage/OperatorDeploymentsPage';
import OperatorInstallModesPage from './pages/operatorBundlePage/OperatorInstallModesPage';
import OperatorOwnedCRDsPage from './pages/operatorBundlePage/OperatorOwnedCRDsPage';
import OperatorRequiredCRDsPage from './pages/operatorBundlePage/OperatorRequiredCRDsPage';
import OperatorPermissionsPage from './pages/operatorBundlePage/OperatorPermissionsPage';
import OperatorClusterPermissionsPage from './pages/operatorBundlePage/OperatorClusterPermissionsPage';
import OperatorOwnedCRDEditPage from './pages/operatorBundlePage/OperatorOwnedCRDEditPage';
import OperatorDeploymentEditPage from './pages/operatorBundlePage/OperatorDeploymentEditPage';
import OperatorRequiredCRDEditPage from './pages/operatorBundlePage/OperatorRequiredCRDEditPage';
import OperatorPermissionsEditPage from './pages/operatorBundlePage/OperatorPermissionsEditPage';
import OperatorClusterPermissionsEditPage from './pages/operatorBundlePage/OperatorClusterPermissionsEditPage';
import OperatorPackagePage from './pages/operatorBundlePage/OperatorPackagePage';

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
          <Route path="/bundle/metadata" component={OperatorMetadataPage} />
          <Route path="/bundle/owned-crds/:crd" component={OperatorOwnedCRDEditPage} />
          <Route path="/bundle/owned-crds" component={OperatorOwnedCRDsPage} />
          <Route path="/bundle/required-crds/:crd" component={OperatorRequiredCRDEditPage} />
          <Route path="/bundle/required-crds" component={OperatorRequiredCRDsPage} />
          <Route path="/bundle/deployments/:deployment" component={OperatorDeploymentEditPage} />
          <Route path="/bundle/deployments" component={OperatorDeploymentsPage} />
          <Route path="/bundle/permissions/:serviceAccountName" component={OperatorPermissionsEditPage} />
          <Route path="/bundle/permissions" component={OperatorPermissionsPage} />
          <Route path="/bundle/package" component={OperatorPackagePage} />
          <Route
            path="/bundle/cluster-permissions/:serviceAccountName"
            component={OperatorClusterPermissionsEditPage}
          />
          <Route path="/bundle/cluster-permissions" component={OperatorClusterPermissionsPage} />
          <Route path="/bundle/install-modes" component={OperatorInstallModesPage} />
          <Route path="/bundle/yaml" component={OperatorYamlEditorPage} />
          <Route path="/bundle" component={OperatorBundlePage} />
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
