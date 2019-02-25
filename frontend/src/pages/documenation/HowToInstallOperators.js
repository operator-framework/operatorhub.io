/* eslint-disable react/jsx-curly-brace-presence */
import * as React from 'react';
import PropTypes from 'prop-types';

import { ExternalLink } from '../../components/ExternalLink';
import DocumentationPage from '../../components/DocumentationPage';
import { olm, olmArchitecture, manageOperatorWithOlm } from '../../utils/documentationLinks';

const pageTitle = 'How to install an Operator from OperatorHub.io';

const HowToInstallOperators = ({ history, ...props }) => {
  const sections = [
    {
      title: `How do I install an Operator from OperatorHub.io?`,
      content: (
        <React.Fragment>
          <p>
            In order to install an Operator from OperatorHub.io, first be sure that you have a Kubernetes cluster (v1.7
            or newer) running with privileges to create new namespaces, <i>ClusterRoles</i>, <i>ClusterRoleBindings</i>{' '}
            and <i>CustomResourceDefinitions</i>. The{' '}
            <ExternalLink href={olm} text="Operator Lifecycle Manager" indicator={false} /> (OLM), a component of the{' '}
            <ExternalLink href={manageOperatorWithOlm} text="Operator Framework" indicator={false} />, must also be
            present in your cluster. OLM makes Operators available for users to install based on the concept of catalogs
            which are repositories of Operators packaged for use with OLM. If you like to learn more about how OLM
            delivers Operators, click <ExternalLink href={olmArchitecture} text="here" indicator={false} />.
          </p>
          <p>
            From there, simply click <b>Install</b> on any Operators detail page. To use the Operator without this
            component, manual installation is usually documented on the website or in the source code repository of the
            Operator maintainers.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `How do I get Operator Lifecycle Manager?`,
      content: (
        <React.Fragment>
          <p>
            A quick way to install OLM on a Kubernetes cluster with default settings and appropriate permission is by
            running this command:
          </p>
          <p className="oh-documentation-page__code_snippet">
            <code>
              kubectl create -f
              https://raw.githubusercontent.com/operator-framework/operator-lifecycle-manager/quickstart/deploy/upstream/quickstart/olm.yaml
            </code>
          </p>
          <p>
            This will deploy OLM, which consists of two Operators (<code>catalog-operator</code> and{' '}
            <code>olm-operator</code>) running in Pods in the <code>olm</code> namespace. OLM is now ready to run.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `What happens when I execute the 'Install' command presented in the pop-up?`,
      content: (
        <React.Fragment>
          <p>
            Once OLM is in your cluster you can execute the provided quick install command. Behind the provided URL,
            OperatorHub.io generates YAML manifests required to deploy an Operator. These create the following
            resources:
          </p>
          <ol className="oh-numbered-list">
            <li>
              A namespace, named after the Operator, in which the Operator will work and which contains all further
              resources below
            </li>
            <li>
              A <code>CatalogSource</code> object that represents a catalog of all the Operators found on
              OperatorHub.io, so OLM knows where to download the Operator
            </li>
            <li>
              An <code>OperatorGroup</code> object that configures the Operator to only watch for the{' '}
              <code>CustomResourceDefinitions</code> in the namespace it’s deployed in
            </li>
            <li>
              And finally a <code>Subscription</code> object that represents your intent to deploy an Operator via OLM,
              triggering the actual installation
            </li>
          </ol>
          <p>
            When executed it typically takes between 20-30 seconds to deploy an Operator. You can watch the progress by
            watching for <i>ClusterServiceVersion</i> objects being deployed in the namespace the command created. See
            below for output at the example of deploying the <i>EtcdOperator</i>:
          </p>
          <pre>
            <p className="oh-documentation-page__code_snippet">
              <code>$ kubectl get csv -n my-etcd -w</code>
              <br />
              <code>{`NAME                  AGE`}</code>
              <br />
              <code>{`etcdoperator.v0.9.2   <invalid>`}</code>
              <br />
              <code>{`etcdoperator.v0.9.2   <invalid>`}</code>
              <br />
              <code>{`etcdoperator.v0.9.2   <invalid>`}</code>
              <br />
              <code>{`etcdoperator.v0.9.2   <invalid>`}</code>
              <br />
              <code>{`etcdoperator.v0.9.2   0s`}</code>
              <br />
              <code>{`etcdoperator.v0.9.2   5s`}</code>
            </p>
          </pre>
          <p>After a while the Operator will be stood up in the form of a Pod:</p>
          <pre>
            <p className="oh-documentation-page__code_snippet">
              <code>$ kubectl get pod -n my-etcd</code>
              <br />
              <code>{`NAME                            READY   STATUS    RESTARTS   AGE`}</code>
              <br />
              <code>{`etcd-operator-9d7b7b6f8-7ghbg   3/3     Running   0          58s`}</code>
              <br />
              <code>{`operatorhubio-catalog-pf9hk     1/1     Running   0          87s`}</code>
            </p>
          </pre>
          <p>
            Next to the Pod for the <i>EtcdOperator</i> you see the Pod the serving the catalog from OperatorHub.io to
            OLM.
          </p>
          <p>
            You can now start using the Operator in the namespace that got created, in the example above{' '}
            <code>my-etcd</code>.
          </p>
          <p>
            <b>Important:</b> The Operator by default is configured to only work in the namespace in which it was
            deployed. In the above example that would be <code>my-etcd</code>. Any of its <i>CustomResources</i> need to
            be placed there. If you like to change that, read about how to configure the <i>OperatorGroup</i> here. In
            short, you need to edit the list in{` `}
            <code>spec.targetNamespaces</code> of the <i>OperatorGroup</i> and add all namespaces in which you want this
            Operator to be usable.
          </p>
          <p>
            Refer to the Operator description on the detail page for <i>CustomResourceDefinitions</i> you can use to
            interact with the Operator in its namespace.
          </p>
        </React.Fragment>
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
