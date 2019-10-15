import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { History } from 'history';

import { DropdownButton, MenuItem } from 'patternfly-react';
import { helpers } from '../../common';
//@ts-ignore
import hubLogo from '../../imgs/operatorhub-header-logo.svg';
import { InternalLink } from '../InternalLink';

export interface HeaderTopBarProps {
  history: History
  scrolled?: boolean
  searchValue?: string
  onSearchChange: (value: string) => void
  searchCallback: (value: string) => void
  clearSearch: () => void
  barRef?: (ref: HTMLElement | null) => void
  homePage?: boolean
}

interface HeaderTopBarState {
  searchValue: string
}

class HeaderTopBar extends React.PureComponent<HeaderTopBarProps, HeaderTopBarState> {

  static propTypes;
  static defaultProps;

  state: HeaderTopBarState = {
    searchValue: ''
  };

  componentDidMount() {
    if (this.props.searchValue !== undefined) {
      this.setState({ searchValue: this.props.searchValue });
    }
  }

  componentDidUpdate(prevProps: HeaderTopBarProps) {
    if (this.props.searchValue !== undefined && this.props.searchValue !== prevProps.searchValue) {
      this.setState({ searchValue: this.props.searchValue });
    }
  }

  onPreviewYourOperator = () => {
    this.props.history.push('/preview');
  };

  onPackageYourOperator = () => {
    this.props.history.push('/bundle');
  };

  onSubmitYourOperator = () => {
    this.props.history.push('/contribute');
  };

  onGettingStarted = () => {
    this.props.history.push('/getting-started');
  };

  onSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.props.searchCallback(this.state.searchValue);
    }
  };

  onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSearchChange(e.target.value);
    this.setState({ searchValue: e.target.value });
  };

  clearSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    this.setState({ searchValue: '' });
    this.props.clearSearch();
  };

  renderSearchForm() {
    return (
      <div className="form-group has-clear">
        <div className="search-pf-input-group">
          <span className="fa fa-search oh-header__top-bar__search-icon" aria-hidden="true" />
          <label htmlFor="search-input" className="sr-only">
            Search Operator Hub
          </label>
          <input
            id="search-input"
            value={this.state.searchValue}
            type="search"
            autoComplete="off"
            className="form-control oh-header__top-bar__search--input"
            placeholder="Search OperatorHub..."
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            onChange={this.onSearchChange}
            onKeyPress={this.onSearchKeyPress}
          />
          <a
            href="#"
            className={classNames('fa fa-times-circle oh-header__top-bar__clear-icon', {
              disabled: !this.state.searchValue
            })}
            onClick={this.clearSearch}
          >
            <span className="sr-only">Clear Search</span>
          </a>
        </div>
      </div>
    );
  }

  render() {
    const { scrolled, barRef } = this.props;
    const topBarClasses = classNames('oh-header__top-bar', { scrolled });

    return (
      <div className={topBarClasses} ref={barRef}>
        <div className="oh-header__top-bar__inner">
          <InternalLink route="/" history={this.props.history} noNavigation={this.props.homePage}>
            <img className="oh-header__top-bar__logo" src={hubLogo} alt="OperatorHub.io" />
          </InternalLink>
          <span className="oh-header__top-bar__spacer" />
          <form className="oh-header__top-bar__search-form search-pf hidden-xs">{this.renderSearchForm()}</form>
          <DropdownButton
            className="oh-header__top-bar__dropdown"
            title="Contribute"
            id="header-contribute-dropdown"
            pullRight
          >
            <MenuItem eventKey={0} onSelect={this.onGettingStarted}>
              Create an Operator with the SDK
            </MenuItem>
            <MenuItem eventKey={1} onSelect={this.onPackageYourOperator}>
              Package your Operator
              <span className="oh-beta-label">BETA</span>
            </MenuItem>
            <MenuItem eventKey={2} onSelect={this.onPreviewYourOperator}>
              Preview your Operator
            </MenuItem>
            <MenuItem eventKey={3} onSelect={this.onSubmitYourOperator}>
              Submit your Operator
            </MenuItem>
          </DropdownButton>
        </div>
        <div className="oh-header__top-bar__xs-search">
          <form className="oh-header__top-bar__search-form search-pf">{this.renderSearchForm()}</form>
        </div>
      </div>
    );
  }
}

HeaderTopBar.propTypes = {
  scrolled: PropTypes.bool,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchCallback: PropTypes.func,
  clearSearch: PropTypes.func,
  barRef: PropTypes.func,
  homePage: PropTypes.bool
};

HeaderTopBar.defaultProps = {
  scrolled: false,
  searchValue: undefined,
  onSearchChange: helpers.noop,
  searchCallback: helpers.noop,
  clearSearch: helpers.noop,
  barRef: helpers.noop,
  homePage: false
};

export { HeaderTopBar };
