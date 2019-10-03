import React from 'react';
import Loader from '../components/other/Loader';
import helpers from './helpers';
import Page from '../components/page/Page';

/**
 * @callback GetComponentCallback
 * @returns {Promise<any>}
 */

/**
 * Placeholder with loader for fetching async component
 * @param {GetComponentCallback} getComponent
 */
export default function asyncComponent(getComponent) {
  class AsyncComponent extends React.Component {
    static Component = null;
    state = { Component: AsyncComponent.Component };

    componentWillMount() {
      if (!this.state.Component) {
        getComponent().then(Component => {
          AsyncComponent.Component = Component;
          this.setState({ Component });
        });
      }
    }

    render() {
      const { Component } = this.state;
      if (Component) {
        return <Component {...this.props} />;
      }
      return (
        <Page
          className="oh-page-operator"
          history={{
            push: path => {
              window.location.pathname = path;
            }
          }}
          showFooter={false}
        >
          {
            // fix top offset so loader is not hidden behind top bar
          }
          <Loader text="Loading content" style={{ marginTop: '100px' }} />
        </Page>
      );
    }
  }
  return AsyncComponent;
}
