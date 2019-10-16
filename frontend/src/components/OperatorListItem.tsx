import React from 'react';
import PropTypes from 'prop-types';
// @ts-ignore
import * as operatorImg from '../imgs/operator.svg';
import { NormalizedOperatorPreview } from '../utils/operatorTypes';

export interface OperatorListItemProps{
  operator: NormalizedOperatorPreview | null
}

const OperatorListItem: React.FC<OperatorListItemProps & React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ operator, ...props }) => {
  if (!operator) {
    return null;
  }

  const { name, displayName, imgUrl, provider, description } = operator;
  const vendor = provider ? `provided by ${provider}` : null;

  return (
    <a id={name} key={name} className="oh-list-view__item" {...props}>
      <div className="catalog-tile-pf-header">
        <img className="catalog-tile-pf-icon" src={imgUrl || operatorImg} alt="" />
        <span>
          <div className="catalog-tile-pf-title">{displayName}</div>
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
  operator: PropTypes.any.isRequired
};

OperatorListItem.defaultProps = {
  operator: null
};

export default OperatorListItem;
