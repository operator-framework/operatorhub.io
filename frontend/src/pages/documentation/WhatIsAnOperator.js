import * as React from 'react';
import PropTypes from 'prop-types';

import { ExternalLink } from '../../components/ExternalLink';
import DocumentationPage from '../../components/page/DocumentationPage';
import { introBlog, sampleCode } from '../../utils/documentationLinks';
import { InternalLink } from '../../components/InternalLink';

const pageTitle = 'What is an Operator';

const WhatIsAnOperator = ({ history, ...props }) => {
  const sections = [
    {
      title: `What is an Operator after all?`,
      content: (
        <React.Fragment>
          <p>
            Operators are a design pattern made public in a 2016 CoreOS{' '}
            <ExternalLink href={introBlog} text="blog" indicator={false} /> post. The goal of an Operator is to put
            operational knowledge into software. Previously this knowledge only resided in the minds of administrators,
            various combinations of shell scripts or automation software like Ansible. It was outside of your Kubernetes
            cluster and hard to integrate. With Operators, CoreOS changed that.
          </p>
          <p>
            Operators implement and automate common Day-1 (installation, configuration, etc) and Day-2
            (re-configuration, update, backup, failover, restore, etc.) activities in a piece of software running inside
            your Kubernetes cluster, by integrating natively with Kubernetes concepts and APIs. We call this a
            Kubernetes-native application. With Operators you can stop treating an application as a collection of
            primitives like <code>Pods</code>, <code>Deployments</code>, <code>Services</code> or{' '}
            <code>ConfigMaps</code>, but instead as a single object that only exposes the knobs that make sense for the
            application.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `How are Operators created?`,
      content: (
        <React.Fragment>
          <p>
            The premise of an Operator is to have it be a custom form of <code>Controllers</code>, a core concept of
            Kubernetes. A controller is basically a software loop that runs continuously on the Kubernetes master nodes.
            In these loops the control logic looks at certain Kubernetes objects of interest. It audits the desired
            state of these objects, expressed by the user, compares that to what’s currently going on in the cluster and
            then does anything in its power to reach the desired state.
          </p>
          <p>
            This declarative model is basically the way a user interacts with Kubernetes. Operators apply this model at
            the level of entire applications. They are in effect application-specific controllers. This is possible with
            the ability to define custom objects, called <i>Custom Resource Definitions</i> (CRD), which were introduced
            in Kubernetes 1.7. An Operator for a custom app would, for example, introduce a CRD called{' '}
            <code>FooBarApp</code>. This is basically treated like any other object in Kubernetes, e.g. a{' '}
            <code>Service</code>.
          </p>
          <p>
            The Operator itself is a piece of software running in a Pod on the cluster, interacting with the Kubernetes
            API server. That’s how it gets notified about the presence or modification of <code>FooBarApp</code>{' '}
            objects. That’s also when it will start running its loop to ensure that the application service is actually
            available and configured in the way the user expressed in the specification of <code>FooBarApp</code>{' '}
            objects. This is called a reconciliation loop (
            <ExternalLink href={sampleCode} text="example code" indicator={false} />
            ). The application service may in turn be implemented with more basic objects like <code>Pods</code>,{' '}
            <code>Secrets</code> or <code>PersistentVolumes</code>, but carefully arranged and initialized, specific to
            the needs of this application. Furthermore, the Operator could possibly introduce an object of type
            <code>FooBarAppBackup</code> and create backups of the app as a result.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `How do I start writing an Operator?`,
      content: (
        <p>
          Head over to{' '}
          <InternalLink route="/getting-started" history={history} text="Jump Start Using the Operator SDK" /> to find
          out how to write your own Operator with Go, Ansible or with Helm charts.
        </p>
      )
    }
  ];

  return <DocumentationPage title={pageTitle} sections={sections} history={history} {...props} />;
};

WhatIsAnOperator.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

export default WhatIsAnOperator;
