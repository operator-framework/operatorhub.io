import * as React from 'react';
import PropTypes from 'prop-types';

import { ExternalLink } from '../../../components/ExternalLink';
import OperatorCRDsPage from './OperatorCRDsPage';
import { sectionsFields } from '../../../utils/constants';

const OperatorRequiredCRDsPage = ({ operator, history }) => {
  const description = (
    <span>
      {"It's"} common for your Operator to use multiple CRDs to link together concepts, such as top-level database
      configuration in one object and a representation of replica sets in another. List out each one in the CSV file.
      Checkout more in <ExternalLink href="#" text="Owned CRDs" />.
    </span>
  );

  const crdsField = sectionsFields['required-crds'];

  return (
    <OperatorCRDsPage
      operator={operator}
      crdsField={crdsField}
      crdsTitle="Required CRDs"
      crdsDescription={description}
      objectPage="required-crds"
      objectType="Required CRD"
      history={history}
    />
  );
};

OperatorRequiredCRDsPage.propTypes = {
  operator: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorRequiredCRDsPage.defaultProps = {
  operator: {}
};

export default OperatorRequiredCRDsPage;
