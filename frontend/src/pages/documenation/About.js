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
  discoveryCatalogs,
  privacyPolicy
} from '../../utils/documentationLinks';
import { InternalLink } from '../../components/InternalLink';

const pageTitle = 'About OperatorHub.io';

const About = ({ history, ...props }) => {
  const sections = [
    {
      title: `Why OperatorHub.io?`,
      content: (
        <React.Fragment>
          <p>
            Operators have been publicized as a{' '}
            <InternalLink route="/what-is-an-operator" history={history} text="concept of Kubernetes native services" />{' '}
            in 2016 by <ExternalLink href={`${introBlog}`} text="CoreOS" indicator={false} />. Since then, significant
            momentum has built up in the Kubernetes community around the idea to put operational logic into software
            running on top of the cluster.
          </p>
          <p>
            While there are several approaches to implement Operators yielding the same level of integration with
            Kubernetes, what has been missing is a central location to find the wide array of great Operators that have
            been built by the community. OperatorHub.io aims to be that central location.
          </p>
          <p>
            In addition to a community-sourced index of Operators, OperatorHub.io also ensures that the set of Operators
            are packaged for easy deployment and management on any Kubernetes cluster. Contributors of Operators not
            only get a chance to publicize their work but provide end users an easy way to start using them. To that end
            the packaging of the Operators indexed in OperatorHub.io relies on the{' '}
            <ExternalLink href={`${olm}`} text="Operator Lifecycle Manager" indicator={false} /> to install, manage and
            update Operators consistently on any Kubernetes cluster.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `Who can benefit from OperatorHub.io?`,
      content: (
        <p>
          In short: everyone who uses Kubernetes. This audience is segmented into two groups: Operator developers and
          users. Developers have the ability to publish and update their Operators on OperatorHub.io following a{' '}
          <InternalLink route="/contribute" history={history} text="community contribution process" />. Users gain
          access to published Operators that have basic documentation and a well defined installation and management
          model. On any Operator, try out the “<b>Install</b>” button.
        </p>
      )
    },
    {
      title: `How does OperatorHub.io work?`,
      content: (
        <React.Fragment>
          <p>
            The content behind OperatorHub.io is sourced from the community operator repository on GitHub and stored in
            quay.io. New content comes in from anyone who wishes to contribute an Operator by the means of a Pull
            Request. Information from the Operators metadata (
            <ExternalLink href={`${buildYourCSV}`} text="ClusterServiceVersion" indicator={false} /> in the{' '}
            <ExternalLink href={`${operatorsRepo}`} text="GitHub repository" indicator={false} /> is used to populated
            the Operators’ detail page on OperatorHub.io. With this metadata Operators are packaged and ready-to-run on
            any Kubernetes cluster that has the Operator Lifecycle Manager (OLM) available. On a Kubernetes cluster, OLM
            allows a user to “
            <ExternalLink href={`${olmArchitecture}`} text="subscribe" indicator={false} />” to an Operator, which
            unifies installation and updates in a single concept. We expect Operators to be long-lived services that are
            constantly updated to provide new capabilities and update the managed application to a newer version. A
            subscription can be made to a{' '}
            <ExternalLink href={`${discoveryCatalogs}`} text="selection of channels" indicator={false} /> (e.g. ‘stable’
            vs. ‘beta’). With the community repository as a source, users can install, use and receive updates for all
            Operators on OperatorHub.io right away.
          </p>
          <p>
            OperatorHub.io’s content is sourced from the community Operator repository on GitHub and stored in quay.io.
            A simple Pull Request is all that is required for any developer to add their Operator to the repository to
            be screened for inclusion on OperatorHub.io. Information from the Operators metadata (
            <ExternalLink href={`${buildYourCSV}`} text="ClusterServiceVersion" indicator={false} />) in the{' '}
            <ExternalLink href={`${operatorsRepo}`} text="GitHub repository" indicator={false} /> is used to populated
            the Operators’ detail page. With this metadata Operators are packaged and ready-to-run on any Kubernetes
            cluster that has the Operator Lifecycle Manager (OLM) available.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `What Operators make it on the list?`,
      content: (
        <React.Fragment>
          <p>
            In general every type of Operator can be on pushed to OperatorHub.io. It is not required that the Operator
            be developed with the <ExternalLink href={`${operatorSdk}`} text="operator-sdk" indicator={false} />.
            However it should be formatted for use with the Operator Lifecycle Manager. It will go through some light
            vetting and packaging before it is published. The Operator’s container image is not pushed to OperatorHub.io
            and can live on any public registry like{' '}
            <ExternalLink href="https://quay.io" text="quay.io" indicator={false} /> or{' '}
            <ExternalLink href="https://hub.docker.com" text="docker.io" indicator={false} />.
          </p>
          <p>
            There should be sufficient description and initial steps available as part of the Operator metadata. It is
            expected that the Operator runs of top of Kubernetes starting with version 1.7. If you need support to test
            your Operator before release, please file an issue on{' '}
            <ExternalLink href={operatorsRepo} text="GitHub" indicator={false} />.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `Who is behind OperatorHub.io?`,
      content: (
        <React.Fragmen>
          <p>
            OperatorHub.io was launched by Red Hat in conjunction with Amazon, Microsoft, and Google forming the initial
            group that are supporting the initiative. Together, this group leveraging their Kubernetes expertise is
            managing the contribution and vetting process for the Operators included in OperatorHub.io. We look forward
            to seeing this list expand with other Kubernetes industry leaders over time.
          </p>
          <p>
            <ExternalLink href={`${privacyPolicy}`} text="Privacy Policy" indicator={false} />
          </p>
        </React.Fragmen>
      )
    }
  ];

  return <DocumentationPage title={pageTitle} sections={sections} history={history} {...props} />;
};

About.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

export default About;
