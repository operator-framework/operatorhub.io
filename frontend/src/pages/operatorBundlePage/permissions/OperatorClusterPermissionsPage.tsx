import React from 'react';
import PropTypes from 'prop-types';
import { History } from 'history';

import OperatorPermissionsPage from './OperatorPermissionsPage';
import { sectionsFields, VersionEditorParamsMatch } from '../../../utils/constants';

const permissionFields = sectionsFields['cluster-permissions'];

export type OperatorClusterPermissionsPageProps = {
  history: History,
  match: VersionEditorParamsMatch,
  operator?: any
}

const OperatorClusterPermissionsPage: React.FC<OperatorClusterPermissionsPageProps> = ({ operator, history, match }) => (
  <OperatorPermissionsPage
    operator={operator}
    history={history}
    match={match}
    title="Cluster Permissions"
    field={permissionFields}
    section="cluster-permissions"
    objectPage="cluster-permissions"
    objectType="Cluster Permission"
  />
);

OperatorClusterPermissionsPage.propTypes = {
  operator: PropTypes.object,
  history: PropTypes.any.isRequired
};

OperatorClusterPermissionsPage.defaultProps = {
  operator: {}
};

export default OperatorClusterPermissionsPage;
