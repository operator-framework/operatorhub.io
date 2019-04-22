import * as React from 'react';
import PropTypes from 'prop-types';

import OperatorCRDEditPage from './OperatorCRDEditPage';

const OperatorRequiredCRDEditPage = ({ operator, history, match }) => (
  <OperatorCRDEditPage
    operator={operator}
    crdsField="spec.customresourcedefinitions.required"
    objectType="Required CRD"
    lastPage="required-crds"
    lastPageTitle="Required CRDs"
    history={history}
    match={match}
  />
);

OperatorRequiredCRDEditPage.propTypes = {
  operator: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired
};

OperatorRequiredCRDEditPage.defaultProps = {
  operator: {}
};

export default OperatorRequiredCRDEditPage;
