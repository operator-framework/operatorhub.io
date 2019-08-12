import * as React from 'react';
import PropTypes from 'prop-types';
import OperatorPermissionsPage from './OperatorPermissionsPage';
import { sectionsFields } from '../bundlePageUtils';

const permissionFields = sectionsFields['cluster-permissions'];

const OperatorClusterPermissionsPage = ({ operator, history }) => (
  <OperatorPermissionsPage
    operator={operator}
    history={history}
    title="Cluster Permissions"
    field={permissionFields}
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
