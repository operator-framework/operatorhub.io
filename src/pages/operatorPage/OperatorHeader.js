import React from 'react';
import PropTypes from 'prop-types';

import { helpers } from '../../common/helpers';
import { HeaderTopBar } from '../../components/HeaderTopBar';

const OperatorHeader = ({ operator, searchValue, searchCallback, clearSearch, headerRef, topBarRef, ...props }) => (
  <div className="oh-header oh-operator-header" ref={headerRef} {...props}>
    <HeaderTopBar
      searchCallback={searchCallback}
      clearSearch={clearSearch}
      searchValue={searchValue}
      barRef={topBarRef}
    />
    <div className="oh-header__content">
      <div className="oh-operator-header__content__image-container">
        <img className="oh-operator-header__content__image" src={operator.imgUrl} alt="" />
      </div>
      <div className="oh-operator-header__content__info">
        <h1 className="oh-operator-header__content__title oh-hero">{operator.name}</h1>
        <div className="oh-operator-header__content__description">{operator.description}</div>
      </div>
    </div>
  </div>
);

OperatorHeader.propTypes = {
  operator: PropTypes.object,
  searchValue: PropTypes.string,
  searchCallback: PropTypes.func.isRequired,
  clearSearch: PropTypes.func.isRequired,
  headerRef: PropTypes.func,
  topBarRef: PropTypes.func
};

OperatorHeader.defaultProps = {
  operator: {},
  searchValue: '',
  headerRef: helpers.noop,
  topBarRef: helpers.noop
};

export { OperatorHeader };
