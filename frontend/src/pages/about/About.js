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
            Kubernetes, what is missing so far is a central location to find and deploy them.{' '}
            <InternalLink route="/" history={history} text="OperatorHub.io" /> aims to be that central place.
          </p>
          <p>
            In addition to a community-sourced index of Operators it is also a way to package Operators for deployment
            on any Kubernetes cluster. Contributors of Operators not only get a chance to publicize their work but
            provide end users an easy way to start using it. To that end OperatorHub.io leverages quay.io and the{' '}
            <ExternalLink href={`${olm}`} text="Operator Lifecycle Manager" indicator={false} /> to store and deploy
            Operators in a consistent fashion on any Kubernetes cluster.
          </p>
          <p>
            While the Operator concept is a definition of how automation of complex applications on Kubernetes should be
            achieved, the lifecycle of such an application and the Operator itself is not addressed. By using the
            Operator Lifecycle Manager, which is part of the{' '}
            <ExternalLink href={`${operatorsFramework}`} text="Operator Framework" indicator={false} />, Kubernetes
            users get access to a service that obtains, installs and updates Operators in their clusters over time.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `Who should use OperatorHub.io?`,
      content: (
        <p>
          In short: everyone who uses Kubernetes. This audience is segmented into two groups: Operator developers and
          users. Developers have the ability to publish and update their Operators on OperatorHub following a{' '}
          <InternalLink route="/contribute" history={history} text="community contribution process" />. Users gain
          access to published Operators including basic documentation and a defined installation method.
        </p>
      )
    },
    {
      title: `How does OperatorHub.io work?`,
      content: (
        <p>
          The content behind OperatorHub.io is sourced from the community operator repository on GitHub and stored in
          quay.io. New content comes in from anyone who wishes to contribute an Operator by the means of a Pull Request.
          Information from the Operators metadata (
          <ExternalLink href={`${buildYourCSV}`} text="ClusterServiceVersion" indicator={false} /> in the{' '}
          <ExternalLink href={`${operatorsRepo}`} text="GitHub repository" indicator={false} /> is used to populated the
          Operators’ detail page on OperatorHub.io. With this metadata Operators are packaged and ready-to-run on any
          Kubernetes cluster that has the Operator Lifecycle Manager (OLM) available. OKD and OpenShift Container
          Platform users have this component installed already. On a Kubernetes cluster, OLM allows a user to “
          <ExternalLink href={`${olmArchitecture}`} text="subscribe" indicator={false} />” to an Operator, which unifies
          installation and updates in a single concept. We expect Operators to be long-lived services that are
          constantly updated to provide new capabilities and update the managed application to a newer version. A
          subscription can be made to a{' '}
          <ExternalLink href={`${discoveryCatalogs}`} text="selection of channels" indicator={false} /> (e.g. ‘stable’
          vs. ‘beta’). With the community repository as a source, users can install, use and receive updates for all
          Operators on OperatorHub.io right away.
        </p>
      )
    },
    {
      title: `What Operators make it on the list?`,
      content: (
        <React.Fragment>
          <p>
            In general every type of Operator can be on pushed to OperatorHub.io. There is some light vetting and
            packaging that takes place before the Operator is published. It is not required that the Operator is
            developed with the <ExternalLink href={`${operatorSdk}`} text="operator-sdk" indicator={false} /> but it
            should be formatted for use with the Operator Lifecycle Manager. The Operator’s container image is not
            pushed to OperatorHub.io but can live on any public registry like{' '}
            <ExternalLink href="https://quay.io" text="quay.io" indicator={false} />
            or <ExternalLink href="https://hub.docker.com" text="docker.io" indicator={false} />.
          </p>
          <p>
            There should be sufficient description and initial steps available as part of the Operator metadata. It is
            expected that the Operator runs of top of Kubernetes starting version 1.7. If you like support to help test
            your Operator before release, please{' '}
            <ExternalLink href={`mailto: ${contactUsEmail}`} text="contact us" indicator={false} />.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `Who is behind OperatorHub.io?`,
      content: (
        <p>
          Initially Red Hat sponsors OperatorHub.io recognizing the need for a unified and consistent experience for
          Operators in production environments. Launched with it’s partners like Amazon Web Services, Microsoft, Redis
          and Couchbase the goal is to have the Open Source and Kubernetes Community lead the initiative and grow the
          ecosystem of Operators.
        </p>
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
