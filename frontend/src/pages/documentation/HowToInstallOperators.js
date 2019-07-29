/* eslint-disable react/jsx-curly-brace-presence */
import * as React from 'react';
import PropTypes from 'prop-types';

import { ExternalLink } from '../../components/ExternalLink';
import DocumentationPage from '../../components/DocumentationPage';
import { olm, olmArchitecture, manageOperatorWithOlm, operatorGroupDesign } from '../../utils/documentationLinks';

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
            present in your cluster. OLM makes Operators available for users to install based on the concept of{' '}
            <i>catalogs</i>
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
              https://raw.githubusercontent.com/operator-framework/operator-lifecycle-manager/master/deploy/upstream/quickstart/olm.yaml
            </code>
          </p>
          <p>
            This will deploy OLM, which consists of two Operators (<code>catalog-operator</code> and{' '}
            <code>olm-operator</code>) running in Pods in the <code>olm</code> namespace. OLM is now ready to run.
          </p>
          <p>
            If you receive permission errors running the above command referring to a failed{' '}
            <i>attempt to grant extra privileges</i> to the <code>system:controller:operator-lifecycle-manager</code>{' '}
            service account, please <code>kubectl delete -f</code> the above command and add more privileges to your
            current user:
          </p>
          <p className="oh-documentation-page__code_snippet">
            <code>
              kubectl create clusterrolebinding cluster-admin-binding --clusterrole cluster-admin --user [USER_NAME]
            </code>
          </p>
          <p>Then retry to install OLM.</p>
        </React.Fragment>
      )
    },
    {
      title: `What happens when I execute the 'Install' command presented in the pop-up?`,
      content: (
        <React.Fragment>
          <p>
            Once OLM is in your cluster you can execute the provided quick install command. Behind the provided URL,
            OperatorHub.io generates YAML manifests required to deploy an Operator.
          </p>
          <blockquote>
            The quick install command generates YAML that makes assumptions about the default catalogs that ship with{' '}
            <ExternalLink
              href="https://github.com/operator-framework/operator-lifecycle-manager/releases/tag/0.10.1"
              text="upstream OLM"
              indicator={false}
            />
            . If you make modifications or have an existing OLM deployment that deviates please adjust the generated
            YAML manifests.
          </blockquote>
          <p>These create the following resources:</p>
          <ol className="oh-numbered-list">
            <li>
              A <code>CatalogSource</code> object that represents a catalog of all the Operators found on
              OperatorHub.io, so OLM knows where to download the Operator
            </li>
            <li>
              A <i>Subscription</i> object that represents your intent to deploy an Operator via OLM, triggering the
              actual installation
            </li>
            <p>
              Optionally, if the Operator is only able to work in a particular namespace, also the following gets
              created:
            </p>
            <li>
              An <code>OperatorGroup</code> object that configures the Operator to only watch for the{' '}
              <code>CustomResourceDefinitions</code> in the namespace it’s deployed in
            </li>
            <li>
              A separate namespace, named after the Operator, in which the Operator following the scheme{' '}
              <code>{`my-<operator-name>`}</code>, in which the Operator and all the resources above
            </li>
          </ol>
          <p>
            This difference will be called out in the <b>Installation</b> dialog.
          </p>
          <p>
            When executed it typically takes between 20-30 seconds to deploy an Operator. You can watch it’s
            <i>ClusterServiceVersion</i> spin up in either the namespace called <code>operators</code> or the namespace
            created by the install command (if applicable).
          </p>
          <p>
            See below for an example of the output from deploying the <i>EtcdOperator</i>:
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
              <code>$ kubectl get pod -n operators</code>
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
            You can now start using the Operator by leveraging it’s <i>CustomResource</i>. The Operator detail page
            contains examples of these in the <i>CustomResourceDefinitions</i> section
          </p>
          <p>
            <b>Important:</b> Most Operators are available in all namespaces in your cluster. Some however do not
            support this. That means, that any of its CustomResources need to be placed in a specific namespace that the
            Operator is watching. For Operators from OperatorHub.io this namespace is called{' '}
            <code>{`my-<operator-name>`}</code>. Also the Operators <i>Pod</i> will be deployed there.
          </p>
          <p>
            This behavior is controlled by the OperatorGroup , you can read more about it{' '}
            <ExternalLink href={operatorGroupDesign} text="here" indicator={false} />. In short, the list in{' '}
            <code>spec.targetNamespace</code> of the OperatorGroup and controls namespaces in which you want this
            Operator to be usable.
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
