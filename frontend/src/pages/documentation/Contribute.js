import * as React from 'react';
import PropTypes from 'prop-types';

import { ExternalLink } from '../../components/ExternalLink';
import DocumentationPage from '../../components/DocumentationPage';
import {
  operatorsRepo,
  operatorsRepoBeforePR,
  operatorsRepoRequirements,
  contributions,
  operatorSdk,
  olm,
  gettingStarted,
  prometheusOperator,
  olmArchitecture,
  buildYourCSV,
  installInstructions,
  operatorRegistry,
  operatorRegistrySteps,
  operatorCourier,
  operatorBundle
} from '../../utils/documentationLinks';
import { InternalLink } from '../../components/InternalLink';

const pageTitle = 'How to contribute an Operator';

const Contribute = ({ history, ...props }) => {
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
            OperatorHub.io is the front-end for the{' '}
            <ExternalLink href={operatorsRepo} text="Community Operators Repository" indicator={false} />. This is an
            open source community project aiming to curate and collect Kubernetes Operators. Community contributions
            live in:
          </p>
          <p>
            <ExternalLink href={contributions} text={contributions} indicator={false} />
          </p>
          <p>
            If you have an Operator you would like to contribute to OperatorHub.io, feel free to create a pull request
            against the above directory. Please read the pull request{' '}
            <ExternalLink href={operatorsRepoBeforePR} text="requirements" indicator={false} /> before creating one to
            ensure all required files are present.
          </p>
          <p>
            The easiest way to package your Operator for OperatorHub.io is to build it with the{' '}
            <ExternalLink href={operatorSdk} text="Operator SDK" indicator={false} />, however it is not a requirement.
            To publish your Operator, it must be built as a binary within a container, and that container must be hosted
            on a publicly accessible <ExternalLink href={operatorRegistry} text="registry" indicator={false} />. It
            should be accompanied by some{' '}
            <ExternalLink href={operatorsRepoRequirements} text="metadata" indicator={false} /> that is used for
            deploying the Operator using the{' '}
            <ExternalLink href={olm} text="Operator Lifecycle Manager" indicator={false} /> in addition to rendering the
            Operator’s detail page on OperatorHub.io.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `Package your Operator`,
      content: (
        <React.Fragment>
          <p>
            Your Operator should be able to be managed by the{' '}
            <ExternalLink href={olm} text="Operator Lifecycle Manager" indicator={false} /> (OLM). This component of the{' '}
            <ExternalLink href={gettingStarted} text="Operator Framework" indicator={false} /> is deployed on your
            Kubernetes cluster and will be able to install the Operator via CLI or through a GUI component like embedded
            OperatorHub in OpenShift.
          </p>
          <p>
            Either way, this requires some catalog data to be created in the form of YAML manifests that follow a
            specific directory structure. Let’s take a look at an example from the{' '}
            <ExternalLink href={contributions} text="community repository" indicator={false} />:
          </p>
          <p>
            Your catalog data should live in a flat directory named after your Operator, e.g. the following files exist
            for the <ExternalLink href={prometheusOperator} text="Prometheus Operator" indicator={false} /> in a
            directory called <code>prometheus</code>.
          </p>
          {renderTable()}
          <p>
            This catalog data will enable OLM to serve, install, and update your Operator in a predictable way instead
            of requiring cluster maintainers to manually deploy (e.g. <code>kubectl create -f ...</code>) required
            manifests that contain CRDs, RBAC rules, Service Accounts, Deployments etc. If you want to learn more about
            how OLM does this, read about it <ExternalLink href={olmArchitecture} text="here" indicator={false} />.
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
            will be used to render the detail page on OperatorHub.io. Follow${' '}
            `}
            <ExternalLink href={buildYourCSV} text="these instructions" indicator={false} /> to create this file.
          </p>
          <p>
            If you add CSV files for newer versions of your Operator, don’t forget to use the <code>spec.replaces</code>{' '}
            property to point to the previous version.
          </p>
          <h3>Package Manifest:</h3>
          <p>
            {`
            The package manifest is a simple list of channels that point to a particular CSV name. This allows OLM to
            serve the Operator from multiple channels, each named to convey that CSV versions' stability and update
            frequency, e.g. stable and alpha. Your package manifest must have at least one channel. For reference, use
            one of the examples in the${' '}
            `}
            <ExternalLink href={contributions} text="community repository" indicator={false} />.
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
            With your CSV written, you can get a preview of your Operator{"'"}s appearance on OperatorHub.io using the{' '}
            <InternalLink route="/preview" history={history} text="preview" /> page.
          </p>
          <p>
            <b>Important:</b> This preview only checks the syntax of your CSV. Please use the{' '}
            <ExternalLink href={operatorCourier} indicator={false} text="operator-courier" /> utility to validate your
            Operator <ExternalLink href={operatorBundle} indicator={false} text="bundle" />.
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
            This will scaffold a CSV within the <code>xx.yy.zz</code> subdirectory of your Operator's${' '}
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
            Before contributing it may be useful to register and deploy your Operator through OLM. To install OLM on
            your Kubernetes cluster follow these{' '}
            <ExternalLink href={installInstructions} text="instructions" indicator={false} /> or check the “Install”
            instructions for an Operator from the index for a one-line install command. When ready, register your
            Operator using the catalog data above following these{' '}
            <ExternalLink href={operatorRegistrySteps} text="steps" indicator={false} />.
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
          After review your Operator will be visible on the index of{' '}
          <InternalLink route="/" history={history} text="OperatorHub.io" />. From there Kubernetes users can follow
          instructions on how to run it on their clusters.
        </p>
      )
    }
  ];

  return <DocumentationPage title={pageTitle} sections={sections} history={history} {...props} />;
};

Contribute.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

export default Contribute;
