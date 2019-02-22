import * as React from 'react';
import PropTypes from 'prop-types';

import { ExternalLink } from '../../components/ExternalLink';
import DocumentationPage from '../../components/DocumentationPage';
import {
  operatorsRepo,
  operatorSdk,
  olm,
  olmArchitecture,
  buildYourCSV,
  introBlog,
  operatorsFramework,
  discoveryCatalogs,
  contactUsEmail
} from '../../utils/documentationLinks';
import { InternalLink } from '../../components/InternalLink';

const pageTitle = 'How to install an Operator from OperatorHub.io';

const HowToInstallOperators = ({ history, ...props }) => {
  const sections = [
    {
      title: `How do I install an Operator from OperatorHub.io?`,
      content: (
        <React.Fragment>
          <p>
            SomeTextHere
          </p>
          <p>
            MoreTextHere
          </p>
        </React.Fragment>
      )
    },
    {
      title: `How do I get Operator Lifecycle Manager?`,
      content: (
        <p>
          SomeTextHere
        </p>
      )
    },
    {
      title: `What happens when I execute the \`Install\` command presented in the pop-up?`,
      content: (
        <p>
          SomeTextHere
        </p>
      )
    }
  ];

  return <DocumentationPage title={pageTitle} sections={sections} history={history} {...props} />;
};

HowToInstallOperators.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

export default HowToInstallOperators;
