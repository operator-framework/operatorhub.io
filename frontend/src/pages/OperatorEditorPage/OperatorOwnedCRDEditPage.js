import * as React from 'react';
import PropTypes from 'prop-types';

import OperatorCRDEditPage from './OperatorCRDEditPage';

const OperatorOwnedCRDEditPage = ({ operator, history, match }) => (
  <OperatorCRDEditPage
    operator={operator}
    crdsField="spec.customresourcedefinitions.owned"
    objectType="Owned CRD"
    lastPage="owned-crds"
    lastPageTitle="Owned CRDs"
    history={history}
    match={match}
  />
);

OperatorOwnedCRDEditPage.propTypes = {
  operator: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired
};

OperatorOwnedCRDEditPage.defaultProps = {
  operator: {}
};

export default OperatorOwnedCRDEditPage;
