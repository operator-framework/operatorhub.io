import * as React from 'react';
import PropTypes from 'prop-types';

import { ExternalLink } from '../../components/ExternalLink';
import DocumentationPage from '../../components/page/DocumentationPage';
import maturityDetailsImg from '../../imgs/capability-level-diagram.svg';
import { operatorSdk, gettingStarted, introBlog } from '../../utils/documentationLinks';
import { InternalLink } from '../../components/InternalLink';

const pageTitle = 'Jump Start Using the Operator-SDK';

const GettingStarted = ({ history, ...props }) => {
  const renderOperatorTypesTable = () => (
    <table className="oh-documentation-page-table">
      <tbody>
        <tr>
          <th>Operator Type</th>
          <th>What the SDK generates</th>
          <th>What you need to define</th>
        </tr>
        <tr>
          <td>Go Operator</td>
          <td>
            <ul>
              <li>General go program structure</li>
              <li>Boilerplate code to talk to the Kubernetes API</li>
              <li>Boilerplate code to watch for Kubernetes objects of interest</li>
              <li>An entry point to the reconciliation loop</li>
              <li>An example YAML files based on CRDs</li>
            </ul>
          </td>
          <td>
            <ul>
              <li>Custom objects via CRDs</li>
              <li>Control loop logic in Go</li>
              <li>Potentially artistic stunts only possible by talking directly to the API from Go</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>Ansible Operator</td>
          <td>
            <ul>
              <li>
                A Go program that runs an Ansible playbook or role every time a certain type of object is detected /
                modified
              </li>
            </ul>
          </td>
          <td>
            <ul>
              <li>Ansible playbook or role</li>
              <li>Custom objects via CRD</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>Helm Operator</td>
          <td>
            <ul>
              <li>A custom object via CRD containing the same properties as the chart{`'`}s values.yaml</li>
              <li>A Go program that reads a helm chart and deploys all its resources</li>
              <li>
                Watch statements to detect changes in the custom objects specification, re-deploying all resources with
                updated values
              </li>
            </ul>
          </td>
          <td>
            <ul>
              <li>The location / repository of the helm chart</li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  );

  const sections = [
    {
      title: `Welcome`,
      content: (
        <p>
          If you are considering making a Kubernetes Operator, you’re not alone. Since their launch in 2016, Kubernetes
          Operators have been solving notoriously tricky problems for Kubernetes users. Operators reduce the complexity
          of deploying a stateful or distributed cluster application on Kubernetes. They help users to achieve the
          simplicity of initial application deployment with Helm charts but without the security implications of running
          Tiller or saving the state of a deployment. Or they also help those starting to develop against the Kubernetes
          API. If you’re looking to build an Operator for any of the above reasons, you’ve come to the right place!
        </p>
      )
    },
    {
      title: `What exactly is an Operator?`,
      content: (
        <React.Fragment>
          <p>
            If you would like to get familiar with the Operator pattern,{' '}
            <InternalLink route="/what-is-an-operator" history={history} text="please read on here" />.
          </p>
        </React.Fragment>
      )
    },
    {
      title: `How do I start writing an Operator?`,
      content: (
        <React.Fragment>
          <p>
            Normally, without any tools and just the basic libraries you would need to learn all about the Kubernetes
            API, the <code>client-go</code> library and the <code>controller-runtime</code> to even be able to start
            watching for certain events or objects in Kubernetes.
          </p>
          <p>
            Fortunately there is the <ExternalLink href={operatorSdk} text="operator-sdk" indicator={false} />, part of
            the <ExternalLink href={introBlog} text="Operator Framework" indicator={false} />, a community project that
            aims at simplifying the whole process of Operator creation to just writing the custom operational logic
            inside the control loop.
          </p>
          <p>
            There are basically three ways of getting there, resulting in the three types of Operators the SDK supports:
          </p>
          {renderOperatorTypesTable()}
          <p>This results in different maturity models of Operators:</p>
          <p>
            <img className="oh-page-getting-started__image" src={maturityDetailsImg} alt="" />
          </p>
          <p>
            Interested? Try the operator-sdk today by following this{' '}
            <ExternalLink href={gettingStarted} text="Getting Started Guide" indicator={false} />.
          </p>
          <p>
            Already have an Operator? Discover how to contribute it to OperatorHub.io{' '}
            <InternalLink route="/contribute" history={history} text="here" />.
          </p>
        </React.Fragment>
      )
    }
  ];

  return <DocumentationPage title={pageTitle} sections={sections} history={history} {...props} />;
};

GettingStarted.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

export default GettingStarted;
