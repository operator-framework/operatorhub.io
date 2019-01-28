import React from 'react';

import { DropdownButton, MenuItem } from 'patternfly-react';

const HeaderTopBar = ({ ...props }) => (
  <div className="oh-hub-header__top-bar">
    <div className="oh-hub-header__top-bar__title">OperatorHub.io</div>
    <form className="oh-hub-header__top-bar__search-form search-pf">
      <div className="form-group has-clear">
        <div className="search-pf-input-group">
          <label htmlFor="search-input" className="sr-only">
            Search Operator Hub
          </label>
          <input
            id="search-input"
            type="search"
            autoComplete="off"
            className="form-control oh-hub-header__top-bar__search--input"
            placeholder="Search OperatorHub..."
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <span className="fa fa-search oh-hub-header__top-bar__search-icon" aria-hidden="true" />
        </div>
      </div>
    </form>
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
  </div>
);

export { HeaderTopBar };
