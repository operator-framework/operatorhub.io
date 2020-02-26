import React from 'react';
import PropTypes from 'prop-types';
import { History } from 'history';

import { ExternalLink } from '../../../components/ExternalLink';
import OperatorCRDsPage from './OperatorCRDsPage';
import { sectionsFields, VersionEditorParamsMatch } from '../../../utils/constants';
import { Operator } from '../../../utils/operatorTypes';

export type  OperatorRequiredCRDsPageProps = {
  history: History
  match: VersionEditorParamsMatch
  operator: Operator
}

const OperatorRequiredCRDsPage: React.FC<OperatorRequiredCRDsPageProps> = ({ operator, history, match }) => {
  const description = (
    <span>
      It&apos;s common for your Operator to use multiple CRDs to link together concepts, such as top-level database
      configuration in one object and a representation of replica sets in another. List out each one in the CSV file.
      Checkout more in <ExternalLink href="#" text="Owned CRDs" indicator />.
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
      removeAlmExamples={false}
      match={match}
    />
  );
};

OperatorRequiredCRDsPage.propTypes = {
  operator: PropTypes.any.isRequired,
  history: PropTypes.any.isRequired
};

OperatorRequiredCRDsPage.defaultProps = {
  operator: {} as any
};

export default OperatorRequiredCRDsPage;
