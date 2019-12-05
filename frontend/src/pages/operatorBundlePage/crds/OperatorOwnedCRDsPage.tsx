import React from 'react';
import PropTypes from 'prop-types';
import { History } from 'history';

import { ExternalLink } from '../../../components/ExternalLink';
import OperatorCRDsPage from './OperatorCRDsPage';
import { sectionsFields, VersionEditorParamsMatch } from '../../../utils/constants';
import { Operator } from '../../../utils/operatorTypes';

export type  OperatorOwnedCRDsPageProps = {
  history: History
  match: VersionEditorParamsMatch
  operator: Operator
}

const OperatorOwnedCRDsPage: React.FC<OperatorOwnedCRDsPageProps> = ({ operator, history, match }) => {
  const description = (
    <span>
      It&apos;s common for your Operator to use multiple CRDs to link together concepts, such as top-level database
      configuration in one object and a representation of replica sets in another. List out each one in the CSV file.
      Checkout more in <ExternalLink href="#" text="Owned CRDs" indicator />.
    </span>
  );
  const crdsField = sectionsFields['owned-crds'];

  return (
    <OperatorCRDsPage
      operator={operator}
      crdsField={crdsField}
      crdsTitle="Owned CRDs"
      crdsDescription={description}
      objectPage="owned-crds"
      objectType="Owned CRD"
      removeAlmExamples
      history={history}
      match={match}
    />
  );
};

OperatorOwnedCRDsPage.propTypes = {
  operator: PropTypes.any.isRequired,
  history: PropTypes.any.isRequired
};

OperatorOwnedCRDsPage.defaultProps = {
  operator: {} as any
};

export default OperatorOwnedCRDsPage;
