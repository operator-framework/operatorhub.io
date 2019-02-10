import * as React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import { Breadcrumb } from 'patternfly-react';

import { ExternalLink } from '../../components/ExternalLink';
import Page from '../../components/Page';
import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';

const introBlogRef = `https://coreos.com/blog/introducing-operators.html`;
const sampleCodeRef = `https://github.com/operator-framework/operator-sdk-samples/blob/master/memcached-operator/pkg/controller/memcached/memcached_controller.go#L77`;
const operatorSdkRef = `https://github.com/operator-framework/operator-sdk`;
const gettingStartedRef = `https://github.com/operator-framework/getting-started`;

const GettingStarted = ({ history, storeKeywordSearch, ...props }) => {
  const onHome = e => {
    e.preventDefault();
    history.push('/');
  };

  const onContribute = e => {
    e.preventDefault();
    history.push('/contribute');
  };

  const searchCallback = searchValue => {
    if (searchValue) {
      storeKeywordSearch(searchValue);
      history.push(`/?keyword=${searchValue}`);
    }
  };

  const renderSection = (title, content) => (
    <React.Fragment>
      <h2>{title}</h2>
      {content}
    </React.Fragment>
  );

  const renderOperatorTypesTable = () => (
    <table className="oh-operator-types-table">
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
              <li>Entry point to the reconciliation loop</li>
              <li>Example YAML files based on CRDs</li>
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

  const renderExpecting = () =>
    renderSection(
      `We’ve been expecting you`,
      <p>
        So you are interested in creating your own Kubernetes operator? Maybe you are tired of the complexity involved
        when deploying a stateful or distributed cluster application on Kubernetes manually. Maybe you want to achieve
        the simplicity of initial application deployment with Helm charts but without the security implications of
        running Tiller or saving the state of a deployment. Or maybe you are just curious about starting to develop
        against the Kubernetes API. In any case you’ve come to the right place!
      </p>
    );

  const renderWhatIsOperator = () =>
    renderSection(
      `What is an Operator after all?`,
      <React.Fragment>
        <p>
          Operators are a design pattern made public in a 2016 CoreOS{' '}
          <ExternalLink href="introBlogRef" text="blog post" indicator={false} />. The goal of an Operator is to put
          operational knowledge into software. Previously this knowledge only resided in the minds of administrators,
          various combinations of shell scripts, automation software like Ansible or locked away in proprietary managed
          services on public clouds. It was outside of your Kubernetes cluster and hard to integrate. With Operators,
          CoreOS changed that.
        </p>
        <p>
          Operators implement and automate common Day-1 (installation, configuration, etc) and Day-2 (re-configuration,
          update, backup, failover, restore, etc.) activities in a piece of software running inside your Kubernetes
          cluster, by integrating natively with Kubernetes concepts and APIs. We call this a Kubernetes-native
          application. With Operators you can stop treating an application as a wild collection of primitives like Pods,
          Deployments, Services or ConfigMaps but as a single object that only exposes the knobs that make sense for the
          application.
        </p>
      </React.Fragment>
    );

  const renderCreation = () =>
    renderSection(
      `How are Operators created?`,
      <React.Fragment>
        <p>
          The premise of an Operator is to have it be a custom form of Controllers, a core concept of Kubernetes. A
          controller is basically a software loop that runs continuously on the Kubernetes master nodes. In these loops
          the control logic looks at certain Kubernetes objects of interest. It audits the desired state of these
          objects, expressed by the user, compares that to what’s currently going on in the cluster and then does
          anything in its power to reach the desired state.
        </p>
        <p>
          This declarative model is basically the way a user interacts with Kubernetes. Operators apply this model at
          the level of entire applications. They are in effect application-specific controllers. This is possible with
          the ability to define custom objects, called <i>Custom Resource Definitions</i> (CRD), which was introduced in
          Kubernetes 1.7. An operator for a custom app would for example introduce a CRD called <code>FooBarApp</code>.
          This is basically treated like any other object in Kubernetes, e.g. a <code>Service</code>.
        </p>
        <p>
          The Operator itself is a piece of software running in a Pod on the cluster, interacting with the Kubernetes
          API server. That’s how it gets notified about the presence or modification of FooBarApp objects. And that’s
          when it will start running its loop to ensure that the application service is actually available and
          configured in the way the user expressed in the specification of FooBarApp objects. This is also called a
          reconciliation loop (<ExternalLink href={sampleCodeRef} text="example code" indicator={false} />
          ). The application service may in turn be implemented with more basic objects like <code>Pods</code>,{' '}
          <code>Secrets</code> or
          <code>PersistentVolumes</code> but carefully arranged and initialized, specific to the needs of this
          application. Furthermore, the Operator could possibly introduce an object of type <code>FooBarAppBackup</code>{' '}
          and create backups of the app as a result.
        </p>
      </React.Fragment>
    );

  const renderStartWriting = () =>
    renderSection(
      `How do I start writing an Operator?`,
      <React.Fragment>
        <p>
          Normally, without any tools and just the basic libraries you would need to learn all about the Kubernetes API,
          the <code>client-go</code> library and the <code>controller-runtime</code> to even be able to start watching
          for certain events or objects in Kubernetes. Fortunately there is the{' '}
          <ExternalLink href={operatorSdkRef} text="operator-sdk" indicator={false} />, part of the
          <ExternalLink href={introBlogRef} text="Operator Framework" indicator={false} />, a community project that
          aims at simplifying the whole process to create an operator down to the level where all that’s left to do is
          writing the custom operational logic inside the control loop.
        </p>
        <p>
          There are basically three ways of getting there, resulting in the three types of Operators the SDK supports:
        </p>
        {renderOperatorTypesTable()}
        <p>This results in different maturity models of Operators:</p>
        <p>
          <span style={{ color: 'red' }}>Insert Maturity Model Image Here</span>
        </p>
        <p>
          <span style={{ color: 'red' }}>Insert Time Line Image Here</span>
        </p>
        <p>
          Interested? Try the operator-sdk today by following this{' '}
          <ExternalLink href={gettingStartedRef} text="Getting Started Guide" indicator={false} />.
        </p>
        <p>
          Already have an Operator? Discover how to contribute it to the OperatorHub{' '}
          <a href="#" onClick={onContribute}>
            here
          </a>
          .
        </p>
      </React.Fragment>
    );

  const toolbarContent = (
    <Breadcrumb>
      <Breadcrumb.Item onClick={e => onHome(e)} href={window.location.origin}>
        Home
      </Breadcrumb.Item>
      <Breadcrumb.Item active>Jump Start Using the Operator-SDK</Breadcrumb.Item>
    </Breadcrumb>
  );

  return (
    <Page
      pageClasses="oh-page-getting-started"
      headerContent={<h1 className="oh-header__content__title oh-hero">Jump Start Using the Operator-SDK</h1>}
      toolbarContent={toolbarContent}
      history={history}
      onHome={onHome}
      searchCallback={searchCallback}
      {...props}
    >
      {renderExpecting()}
      {renderWhatIsOperator()}
      {renderCreation()}
      {renderStartWriting()}
    </Page>
  );
};

GettingStarted.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  storeKeywordSearch: PropTypes.func
};

GettingStarted.defaultProps = {
  storeKeywordSearch: helpers.noop
};

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  storeKeywordSearch: keywordSearch =>
    dispatch({
      type: reduxConstants.SET_KEYWORD_SEARCH,
      keywordSearch
    })
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GettingStarted);
