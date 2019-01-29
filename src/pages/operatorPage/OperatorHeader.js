import React from 'react';
import PropTypes from 'prop-types';

import { HeaderTopBar } from '../../components/HeaderTopBar';

const OperatorHeader = ({ operator, searchValue, searchCallback, clearSearch, ...props }) => (
  <div className="oh-header oh-operator-header" {...props}>
    <HeaderTopBar searchCallback={searchCallback} clearSearch={clearSearch} searchValue={searchValue} />
    <div className="oh-header__content">
      <img className="oh-operator-header__content__image" src={operator.imgUrl} alt="" />
      <div className="oh-operator-header__content__info">
        <h1 className="oh-operator-header__content__title">{operator.name}</h1>
        <div className="oh-operator-header__content__description">{operator.description}</div>
      </div>
    </div>
  </div>
);

OperatorHeader.propTypes = {
  operator: PropTypes.object,
  searchValue: PropTypes.string,
  searchCallback: PropTypes.func.isRequired,
  clearSearch: PropTypes.func.isRequired
};

OperatorHeader.defaultProps = {
  operator: {},
  searchValue: ''
};

export { OperatorHeader };
