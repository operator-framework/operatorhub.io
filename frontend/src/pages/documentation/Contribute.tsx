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
            <span className="oh-code">/0.22.2/alertmanagers.monitoring.coreos.com.crd.yaml,</span>
            <span className="oh-code">/0.22.2/prometheuses.monitoring.coreos.com.crd.yaml,</span>
            <span className="oh-code">/0.22.2/prometheusrules.monitoring.coreos.com.crd.yaml,</span>
            <span className="oh-code">/0.22.2/servicemonitors.monitoring.coreos.com.crd.yaml</span>
          </td>
          <td>Custom Resource Definition (CRD)</td>
          <td>Kubernetes Custom Resource Definitions that are owned and watched by the Operator</td>
        </tr>
        <tr>
          <td>
            <span className="oh-code">/0.22.2/prometheusoperator.0.22.2.clusterserviceversion.yaml</span>
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
            against the above directory. Please read&nbsp;
            <ExternalLink href={documentationLinks.operatorsRepoBeforePR} text="submitting your operator" />
            &nbsp;before creating one to ensure all required files are present.
          </p>
          <p>
            The easiest way to package your Operator for OperatorHub.io is to build it with the&nbsp;
            <ExternalLink href={documentationLinks.operatorSdk} text="Operator SDK" />, however it is
            not a requirement. To publish your Operator, it must be built as a binary within a container, and that
            container must be hosted on a publicly accessible&nbsp;
            <ExternalLink href={documentationLinks.operatorRegistry} text="registry" />. The Operator should be&nbsp;
            <ExternalLink href={documentationLinks.operatorsRepoRequirements} text="packaged" /> so it can be deployed using the&nbsp;
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
            component like embedded OperatorHub in OpenShift.
          </p>
          <p>
            Your Operator submission can be formatted either following the <b><code>packagemanifest</code></b> or the
            newer <b><code>bundle</code></b> format. The former allows to ship your entire Operator with all its versions in
            one single directory. The latter allows shipping individual releases in container images. Both are supported
            but mixing of formats within a single Operator is not allowed. You need to decide for one or the other
            for your entire Operator listing. If you are new to this or you don't have this format yet, refer to our&nbsp;
            <ExternalLink href={documentationLinks.operatorsRepoRequirements} text="contribution documentation" />.
          </p>
          <h3>ClusterServiceVersion</h3>
          <p>
            The bulk of your Operator's catalog metadata will reside in a ClusterServiceVersion (CSV) file, of which there
            is one per version of your Operator. This file contains the specifications of how to deploy your Operator,
            and information on which CRDs it owns and those it depends on from other Operators. In addition this is
            where you put a description, logo, version, maturity level, authoring info, links etc. for your Operator.
            This information will be used to render the detail page on OperatorHub.io.
          </p>
          <p>
            {`
            Checkout more details in how to
            `}
            <ExternalLink href={documentationLinks.buildYourCSV} text="create a ClusterServiceVersion" />.
          </p>
          <p>
          </p>
          <h3>CustomResourceDefinitions</h3>
          <p>
            These should already exist if your Operator watches CRDs. Place each CRD that your Operator owns in it’s own
            YAML file. CRDs that your Operator does not own but watches are handled by OLMs dependency management.
          </p>
          <h3>PackageManifest Format</h3>
          <p>
            The <b><code>packagemanifest</code></b> is a simple list of channels that point to a particular CSV name. This allows OLM to
            serve the Operator from multiple channels, each named to convey that CSV versions' stability and update
            frequency, e.g. stable and alpha. Your package manifest must have at least one channel. For reference, use
            one of the examples in the&nbsp;
            <ExternalLink href={documentationLinks.contributions} text="community repository" />.
          </p>
          <p>Checkout more details in how to&nbsp;
            <ExternalLink href={documentationLinks.createPackageManifest} text="create a release using the packagemanifest format" />.
          </p>
          <blockquote>
          <h4>Operator Package Editor</h4>
          <p>
            You can now create your Operator packagemanifest from Operatorhub.io using the&nbsp;
            <InternalLink route="/packages" history={history}>
              package editor
            </InternalLink>
            . Either starting from scratch by uploading your Kubernetes YAML manifests, the editor will populate
            form fields with all valid information to create the new Operator packagemanifest, or feel free to create
             from an existing Community Operator Package as a template and modify or add properties through these forms.
          </p>
          <p>
            The Operator package editor is now available in beta.&nbsp;
            <ExternalLink href={documentationLinks.fileAnIssue} indicator>Feedback and questions</ExternalLink> are encouraged.
          </p>
          </blockquote>
          <h3>Bundle Format</h3>
          <p>
            Alternatively you can use the <b><code>bundle</code></b> format, which is nowadays also the default of the Operator-SDK.
            The <b><code>bundle</code></b> format has a top-level directory named after your Operator name in the CSV.
            Inside are sub-directories for the individual bundle, named after the&nbsp;
            <ExternalLink href={documentationLinks.semanticVersioning} text="semantic versioning" />&nbsp;release of your Operator.
          </p>
          <p>Checkout more details in how to&nbsp;
            <ExternalLink href={documentationLinks.createBundle} text="create a release using the bundle format" />.
          </p>
          <h3>Moving from PackageManifest to Bundle Format</h3>
          <p>
            Eventually this repository will only accept <b><code>bundle</code></b> format at some point in the future.
          Also the <b><code>bundle</code></b> format has more features like <b><code>semver</code></b> mode or, in the future,
          installing bundles directly outside of a catalog.
          </p>
          <p>Migration of existing content, irregardless of whether the Operator was created with the SDK, can be achieved
            with the <b><code>opm</code></b> tool on per Operator version basis. Checkout more details in how to&nbsp;
            <ExternalLink href={documentationLinks.packagemanifestToBundle} text="move from packagemanifest to bundle format" />.</p>
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
            A large part of the information gathered in the CSV is used for user-friendly visualization on OperatorHub.io
            or components like the embedded OperatorHub in OpenShift. Your work is on display, so please ensure to provide
            relevant information in your Operator's description, specifically covering:</p>
          <p>
            <ul>
              <li>What the managed application is about and where to find more information</li>
              <li>The features your Operator and how to use it</li>
              <li>Any manual steps required to fulfill pre-requisites for running / installing your Operator</li>
            </ul>
          </p>
          <p>
            <b>Important:</b> This preview only checks the syntax of your CSV. Please check out&nbsp;
            <ExternalLink href={documentationLinks.operatorMetadataValidation} text="Operator Metadata Validation" />
            &nbsp;to validate your Operator.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `Create Catalog Data with the Operator SDK`,
      content: (
        <React.Fragment>
          <p>
            If you are developing your Operator with the Operator SDK you can leverage its packaging tooling to create
            a <b><code>bundle</code></b> by running the following command:
          </p>
          <p>
            <code>$ make bundle</code>
          </p>
          <p>
            The command will create the following bundle artifacts:</p>
            <p>
            <ul>
              <li>a manifests directory (<b><code>bundle/manifests</code></b>) containing a CSV and all CRDs from config/crds</li>
              <li>a&nbsp;
              <ExternalLink href={documentationLinks.bundleAnnotations} text="metadata" />&nbsp;directory
              (<b><code>bundle/metadata</code></b>), and&nbsp;
              <ExternalLink href={documentationLinks.bundleDockerfile} text="bundle.Dockerfile" />&nbsp;
               have been created in the Operator project. </li>
            </ul>
          </p>
          <p>
            This will scaffold a CSV on version <b><code>x.y.z</code></b>, which is set in the project <b><code>Makefile</code></b>
            &nbsp;variable <b><code>VERSION</code></b>. See more details in&nbsp;
            <ExternalLink href={documentationLinks.sdkQuickstartBundle} text="OLM Integration Bundle Quickstart" />.
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
      title: `When will my Operator show up?`,
      content: (
        <p>
          After running automated tests and review your Operator will be visible on the index of&nbsp;
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
