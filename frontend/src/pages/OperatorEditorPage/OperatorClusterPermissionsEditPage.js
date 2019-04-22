import * as React from 'react';
import PropTypes from 'prop-types';
import OperatorPermissionsEditPage from './OperatorPermissionsEditPage';

const OperatorClusterPermissionsEditPage = ({ operator, history, match }) => (
  <OperatorPermissionsEditPage
    operator={operator}
    history={history}
    match={match}
    field="spec.install.spec.clusterPermissions"
    objectType="Cluster Permissions"
    objectsTitle="Cluster Permissions"
    objectPage="cluster-permissions"
  />
);

OperatorClusterPermissionsEditPage.propTypes = {
  operator: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired
};

OperatorClusterPermissionsEditPage.defaultProps = {
  operator: {}
};

export default OperatorClusterPermissionsEditPage;
