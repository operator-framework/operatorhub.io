import * as React from 'react';
import PropTypes from 'prop-types';
import OperatorPermissionsEditPage from './OperatorPermissionsEditPage';
import { sectionsFields } from '../../../utils/constants';

const permissionFields = sectionsFields['cluster-permissions'];

const OperatorClusterPermissionsEditPage = ({ operator, history, match, isNew }) => (
  <OperatorPermissionsEditPage
    operator={operator}
    history={history}
    match={match}
    field={permissionFields}
    objectType="Cluster Permissions"
    objectsTitle="Cluster Permissions"
    objectPage="cluster-permissions"
    isNew={isNew}
  />
);

OperatorClusterPermissionsEditPage.propTypes = {
  operator: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired,
  isNew: PropTypes.bool
};

OperatorClusterPermissionsEditPage.defaultProps = {
  operator: {},
  isNew: false
};

export default OperatorClusterPermissionsEditPage;
