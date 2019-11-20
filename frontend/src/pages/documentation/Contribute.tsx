import { History } from 'history';
import PropTypes from 'prop-types';
import React from 'react';

import { ExternalLink } from '../../components/ExternalLink';
import { InternalLink } from '../../components/InternalLink';
import DocumentationPage from '../../components/page/DocumentationPage';
import * as documentationLinks from '../../utils/documentationLinks';


export interface ContributePageProps {
  history: History
}

const Contribute: React.FC<ContributePageProps> = ({ history, ...props }) => {
  const renderTable = () => (
    <table className="oh-documentation-page-table">
      <tbody>
        <tr>
          <th>File(s)</th>
          <th>File Type</th>
          <th>Content</th>
        </tr>
        <tr>
          <td>
            <span className="oh-code">alertmanager.crd.yaml,</span>
            <span className="oh-code">prometheus.crd.yaml,</span>
            <span className="oh-code">prometheusrule.crd.yaml,</span>
            <span className="oh-code">servicemonitor.crd.yaml</span>
          </td>
          <td>Custom Resource Definition (CRD)</td>
          <td>Kubernetes Custom Resource Definitions that are owned and watched by the Operator</td>
        </tr>
        <tr>
          <td>
            <span className="oh-code">prometheusoperator.0.14.0.clusterserviceversion.yaml,</span>
            <span className="oh-code">prometheusoperator.0.15.0.clusterserviceversion.yaml</span>
            <span className="oh-code">prometheusoperator.0.22.2.clusterserviceversion.yaml</span>
          </td>
          <td>Cluster Service Version (CSV)</td>
          <td>
            Main catalog data for an Operator, with semantic version filename, specifying metadata like description,
            logo as well as owned CRDs, required RBAC, dependencies, and versioning
          </td>
        </tr>
        <tr>
          <td>
            <span className="oh-code">prometheus.package.yaml</span>
          </td>
          <td>Package Manifest</td>
          <td>Top Level catalog data to offer multiple update channels (e.g. stable vs. alpha)</td>
        </tr>
      </tbody>
    </table>
  );

  const sections = [
    {
      title: `Publish your Operator on OperatorHub.io`,
      content: (
        <React.Fragment>
          <p>
            OperatorHub.io is the front-end for the&nbsp;
            <ExternalLink
              href={documentationLinks.operatorsRepo}
              text="Community Operators Repository"

            />
            . This is an open source community project aiming to curate and collect Kubernetes Operators. Community
            contributions live in:
          </p>
          <p>
            <ExternalLink
              href={documentationLinks.contributions}
              text={documentationLinks.contributions}

            />
          </p>
          <p>
            If you have an Operator you would like to contribute to OperatorHub.io, feel free to create a pull request
            against the above directory. Please read the pull request&nbsp;
            <ExternalLink href={documentationLinks.operatorsRepoBeforePR} text="requirements" />
            &nbsp;before creating one to ensure all required files are present.
          </p>
          <p>
            The easiest way to package your Operator for OperatorHub.io is to build it with the&nbsp;
            <ExternalLink href={documentationLinks.operatorSdk} text="Operator SDK" />, however it is
            not a requirement. To publish your Operator, it must be built as a binary within a container, and that
            container must be hosted on a publicly accessible&nbsp;
            <ExternalLink href={documentationLinks.operatorRegistry} text="registry" />. It should be
            accompanied by some&nbsp;
            <ExternalLink href={documentationLinks.operatorsRepoRequirements} text="metadata" /> that
            is used for deploying the Operator using the&nbsp;
            <ExternalLink href={documentationLinks.olm} text="Operator Lifecycle Manager" /> in
            addition to rendering the Operator’s detail page on OperatorHub.io.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `Package your Operator`,
      content: (
        <React.Fragment>
          <p>
            Your Operator should be able to be managed by the&nbsp;
            <ExternalLink href={documentationLinks.olm} text="Operator Lifecycle Manager" /> (OLM).
            This component of the&nbsp;
            <ExternalLink href={documentationLinks.gettingStarted} text="Operator Framework" /> is
            deployed on your Kubernetes cluster and will be able to install the Operator via CLI or through a GUI
            component like embedded OperatorHub in OpenShift. Either way, this requires some catalog data to be created
            in the form of YAML manifests that follow a specific directory structure.
          </p>
          <h3>Operator Bundle Editor</h3>
          <p>
            You can now create your Operator bundle from Operatorhub.io using the&nbsp;
            <InternalLink route="/bundle" history={history}>
              bundle editor
            </InternalLink>
            . Starting by uploading your Kubernetes YAML manifests, the forms on the page will be populated with all
            valid information and used to create the new Operator bundle. You can modify or add properties through these
            forms as well.
          </p>
          <blockquote>
            The Operator bundle editor is now available in beta.&nbsp;
            <ExternalLink href={documentationLinks.fileAnIssue} indicator>Feedback and questions</ExternalLink> are encouraged.
          </blockquote>
          <p>
            Let’s take a look at an example from the&nbsp;
            <ExternalLink href={documentationLinks.contributions} text="community repository" />:
          </p>
          <p>
            Your catalog data should live in a flat directory named after your Operator, e.g. the following files exist
            for the&nbsp;
            <ExternalLink href={documentationLinks.prometheusOperator} text="Prometheus Operator" />
            &nbsp;in a directory called <code>prometheus</code>.
          </p>
          {renderTable()}
          <p>
            This catalog data will enable OLM to serve, install, and update your Operator in a predictable way instead
            of requiring cluster maintainers to manually deploy (e.g. <code>kubectl create -f ...</code>) required
            manifests that contain CRDs, RBAC rules, Service Accounts, Deployments etc. If you want to learn more about
            how OLM does this, read about it&nbsp;
            <ExternalLink href={documentationLinks.olmArchitecture} text="here" />.
          </p>
          <h3>Custom Resource Definitions:</h3>
          <p>
            These should already exist if your Operator watches CRDs. Place each CRD that your Operator owns in it’s own
            YAML file. CRDs that your Operator does not own but watches are handled by OLMs dependency management.
          </p>
          <h3>Cluster Service Version:</h3>
          <p>
            {`
            The bulk of your Operator's catalog metadata will reside in a CSV file, of which there is one per version of
            your Operator. This file contains the specifications of how to deploy your Operator, and information on
            which CRDs it owns and those it depends on from other Operators. In addition this is where you put a
            description, logo, version, maturity level, authoring info, links etc. for your Operator. This information
            will be used to render the detail page on OperatorHub.io. Follow$&nbsp;
            `}
            <ExternalLink href={documentationLinks.buildYourCSV} text="these instructions" /> to
            create this file.
          </p>
          <p>
            If you add CSV files for newer versions of your Operator, don’t forget to use the <code>spec.replaces</code>
            &nbsp;property to point to the previous version.
          </p>
          <h3>Package Manifest:</h3>
          <p>
            {`
            The package manifest is a simple list of channels that point to a particular CSV name. This allows OLM to
            serve the Operator from multiple channels, each named to convey that CSV versions' stability and update
            frequency, e.g. stable and alpha. Your package manifest must have at least one channel. For reference, use
            one of the examples in the$&nbsp;
            `}
            <ExternalLink href={documentationLinks.contributions} text="community repository" />.
          </p>
          <p>Feel free to use existing Community Operators catalog data as a template.</p>
        </React.Fragment>
      )
    },
    {
      title: `Preview your Cluster Service Version`,
      content: (
        <React.Fragment>
          <p>
            With your CSV written, you can get a preview of your Operator&apos;s appearance on OperatorHub.io using
            the&nbsp;
            <InternalLink route="/preview" history={history} text="preview" /> page.
          </p>
          <p>
            <b>Important:</b> This preview only checks the syntax of your CSV. Please use the&nbsp;
            <ExternalLink href={documentationLinks.operatorCourier} text="operator-courier" /> utility
            to validate your Operator&nbsp;
            <ExternalLink href={documentationLinks.operatorBundle} text="bundle" />.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `Create Catalog Data with the Operator SDK:`,
      content: (
        <React.Fragment>
          <p>
            If you are developing your Operator with the Operator SDK you can simply create most of this catalog data by
            running the following command:
          </p>
          <p>
            <code>$ operator-sdk olm-catalog gen-csv --csv-version xx.yy.zz</code>
          </p>
          <p>
            {`
            This will scaffold a CSV within the <code>xx.yy.zz</code> subdirectory of your Operator's$&nbsp;
            `}
            <code>deploy</code> directory.
          </p>
          <p>
            To version your CRDs alongside your CSV, pass the <code>--update-crds</code> flag to the above command. This
            will copy your CRDs into the <code>xx.yy.zz</code> subdirectory, effectively creating an Operator bundle for
            you to register.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `Test your Operator with OLM`,
      content: (
        <React.Fragment>
          <p>
            Before contributing it may be useful to register and deploy your Operator through OLM. To install OLM on a
            local Kubernetes cluster follow the&nbsp;
            <ExternalLink
              href={documentationLinks.manualTestingOnKubernetes}
              text="instruction for manual, local testing"

            />
            . This will speed up the submission process significantly.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `Create a Pull Request`,
      content: (
        <p>
          When you have completed drafting your catalog data, create a pull request with your Operator catalog data only
          in the <code>upstream-community-operators</code> subdirectory. Your manifests will be checked for syntax,
          completeness, and functional deployment. Any enhancements will be discussed in the PR. Upon success we will
          merge it and your contribution is complete.
        </p>
      )
    },
    {
      title: `How will my Operator show up?`,
      content: (
        <p>
          After review your Operator will be visible on the index of&nbsp;
          <InternalLink route="/" history={history} text="OperatorHub.io" />. From there Kubernetes users can follow
          instructions on how to run it on their clusters.
        </p>
      )
    }
  ];

  return <DocumentationPage
    title="How to contribute an Operator"
    sections={sections}
    history={history}
    {...props}
  />;
};

Contribute.propTypes = {
  history: PropTypes.any.isRequired
};

export default Contribute;
