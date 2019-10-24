import React from 'react';
import Loader from '../components/other/Loader';
import Page from '../components/page/Page';
import { History } from 'history';

export interface AsyncComponentProps{
  [key:string] : any
}

/**
 * Placeholder with loader for fetching async component
 * @param {() => any} getComponent
 */
export default function asyncComponent(getComponent: () => any) {

  class AsyncComponent extends React.Component<AsyncComponentProps> {

    static Component = null;

    state: {Component: React.ComponentClass | null} = { Component: AsyncComponent.Component };

    UNSAFE_componentWillMount() {

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
          } as History}
          searchValue={''}
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
