import * as React from 'react';
import PropTypes from 'prop-types';
import * as operatorImg from '../imgs/operator.svg';

const OperatorListItem = ({ operator, ...props }) => {
  if (!operator) {
    return null;
  }

  const { name, imgUrl, author, description } = operator;
  const vendor = author ? `provided by ${author}` : null;

  return (
    <a id={name} key={name} className="oh-list-view__item" {...props}>
      <div className="catalog-tile-pf-header">
        <img className="catalog-tile-pf-icon" src={imgUrl || operatorImg} alt="" />
        <span>
          <div className="catalog-tile-pf-title">{name}</div>
          <div className="catalog-tile-pf-subtitle">{vendor}</div>
        </span>
      </div>
      <div className="catalog-tile-pf-description">
        <span>{description}</span>
      </div>
    </a>
  );
};

OperatorListItem.propTypes = {
  operator: PropTypes.object
};

OperatorListItem.defaultProps = {
  operator: null
};

export default OperatorListItem;
