import * as React from 'react';
import PropTypes from 'prop-types';
import OperatorPermissionsEditPage from './OperatorPermissionsEditPage';
import { sectionsFields } from './bundlePageUtils';

const permissionFields = sectionsFields['cluster-permissions'];

const OperatorClusterPermissionsEditPage = ({ operator, history, match }) => (
  <OperatorPermissionsEditPage
    operator={operator}
    history={history}
    match={match}
    field={permissionFields}
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
