import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { DropdownButton, MenuItem } from 'patternfly-react';
import { helpers } from '../common/helpers';
import hubLogo from '../imgs/operatorhub-header-logo.svg';

class HeaderTopBar extends React.Component {
  state = {
    searchValue: ''
  };

  componentDidMount() {
    this.setState({ searchValue: this.props.searchValue });
  }

  componentDidUpdate(prevProps) {
    if (this.props.searchValue !== prevProps.searchValue) {
      this.setState({ searchValue: this.props.searchValue });
    }
  }

  onLogoClick = e => {
    e.preventDefault();
    this.props.onHome(e);
  };

  onSearchKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.props.searchCallback(this.state.searchValue);
    }
  };

  onSearchChange = e => {
    this.props.onSearchChange(e.target.value);
    this.setState({ searchValue: e.target.value });
  };

  clearSearch = e => {
    e.preventDefault();
    this.setState({ searchValue: '' });
    this.props.clearSearch();
  };

  renderSearchForm() {
    return (
      <div className="form-group has-clear">
        <div className="search-pf-input-group">
          <span className="fa fa-search oh-hub-header__top-bar__search-icon" aria-hidden="true" />
          <label htmlFor="search-input" className="sr-only">
            Search Operator Hub
          </label>
          <input
            id="search-input"
            value={this.state.searchValue}
            type="search"
            autoComplete="off"
            className="form-control oh-hub-header__top-bar__search--input"
            placeholder="Search OperatorHub..."
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            onChange={this.onSearchChange}
            onKeyPress={this.onSearchKeyPress}
          />
          <a
            href="#"
            className={classNames('fa fa-times-circle oh-hub-header__top-bar__clear-icon', {
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
    return (
      <div className="oh-hub-header__top-bar" ref={this.props.barRef}>
        <div className="oh-hub-header__top-bar__content">
          <a href={window.location.origin} onClick={e => this.onLogoClick(e)}>
            <img className="oh-hub-header__top-bar__logo" src={hubLogo} alt="OperatorHub.io" />
          </a>
          <span className="oh-hub-header__top-bar__spacer" />
          <form className="oh-hub-header__top-bar__search-form search-pf hidden-xs">{this.renderSearchForm()}</form>
          <DropdownButton
            className="oh-hub-header__top-bar__dropdown"
            title="Contribute"
            id="header-contribute-dropdown"
            pullRight
          >
            <MenuItem eventKey={0}>Submit your Operator</MenuItem>
            <MenuItem eventKey={1}>Create an Operator with the SDK</MenuItem>
          </DropdownButton>
        </div>
        <div className="oh-hub-header__top-bar__xs-search">
          <form className="oh-hub-header__top-bar__search-form search-pf">{this.renderSearchForm()}</form>
        </div>
      </div>
    );
  }
}

HeaderTopBar.propTypes = {
  onHome: PropTypes.func,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchCallback: PropTypes.func,
  clearSearch: PropTypes.func.isRequired,
  barRef: PropTypes.func
};

HeaderTopBar.defaultProps = {
  onHome: helpers.noop,
  searchValue: '',
  onSearchChange: helpers.noop,
  searchCallback: helpers.noop,
  barRef: helpers.noop
};

export { HeaderTopBar };
