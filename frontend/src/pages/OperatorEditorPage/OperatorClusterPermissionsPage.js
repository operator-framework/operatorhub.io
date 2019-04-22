import * as React from 'react';
import PropTypes from 'prop-types';
import OperatorPermissionsPage from './OperatorPermissionsPage';

const OperatorClusterPermissionsPage = ({ operator, history }) => (
  <OperatorPermissionsPage
    operator={operator}
    history={history}
    title="Cluster Permissions"
    field="spec.install.spec.clusterPermissions"
    section="cluster-permissions"
    objectPage="cluster-permissions"
    objectType="Cluster Permission"
  />
);

OperatorClusterPermissionsPage.propTypes = {
  operator: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorClusterPermissionsPage.defaultProps = {
  operator: {}
};

export default OperatorClusterPermissionsPage;
