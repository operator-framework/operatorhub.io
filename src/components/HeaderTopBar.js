import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { DropdownButton, Grid, MenuItem } from 'patternfly-react';
import { helpers } from '../common/helpers';

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

  onSearchKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.props.searchCallback(this.state.searchValue);
    }
  };

  onSearchChange = e => {
    this.setState({ searchValue: e.target.value });
  };

  clearSearch = e => {
    e.preventDefault();
    this.setState({ searchValue: '' });
    this.props.clearSearch();
  };

  render() {
    return (
      <div className="oh-hub-header__top-bar row" ref={this.props.barRef}>
        <Grid.Col className="oh-hub-header__top-bar__title" xs={6}>
          OperatorHub.io
        </Grid.Col>
        <Grid.Col xs={6} smPush={4} sm={2}>
          <DropdownButton
            className="oh-hub-header__top-bar__dropdown"
            title="Contribute"
            id="header-contribute-dropdown"
            pullRight
          >
            <MenuItem eventKey={0}>Contribute Item 1</MenuItem>
            <MenuItem eventKey={1}>Contribute Item 2</MenuItem>
            <MenuItem eventKey={2}>Contribute Item 3</MenuItem>
            <MenuItem eventKey={3}>Contribute Item 4</MenuItem>
          </DropdownButton>
        </Grid.Col>
        <Grid.Col xs={12} smPull={2} sm={4}>
          <form className="oh-hub-header__top-bar__search-form search-pf">
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
          </form>
        </Grid.Col>
      </div>
    );
  }
}

HeaderTopBar.propTypes = {
  searchValue: PropTypes.string,
  searchCallback: PropTypes.func.isRequired,
  clearSearch: PropTypes.func.isRequired,
  barRef: PropTypes.func
};

HeaderTopBar.defaultProps = {
  searchValue: '',
  barRef: helpers.noop
};

export { HeaderTopBar };
