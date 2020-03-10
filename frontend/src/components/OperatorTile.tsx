import React from 'react';
import PropTypes from 'prop-types';
import { CatalogTile } from 'patternfly-react-extensions';
//@ts-ignore
import operatorImg from '../imgs/operator.svg';
import { NormalizedOperatorPreview } from '../utils/operatorTypes';

export interface OperatorTileProps{
  operator: NormalizedOperatorPreview | null
  [key: string]: any
}

const OperatorTile: React.FC<OperatorTileProps> = ({ operator, ...props }) => {
  if (!operator) {
    return null;
  }

  const { name, displayName, imgUrl, provider, description, managedBy } = operator;
  const vendor = provider ? `provided by ${provider}` : null;

  const badge = (
    <span className="oh-hub-page__tile-badge">
      {managedBy}
    </span>
  );

  return (
    <CatalogTile
      id={name}
      title={displayName}
      iconImg={imgUrl || operatorImg}
      badges={[badge]}
      vendor={vendor}
      description={description}
      {...props}
    />
  );
};

OperatorTile.propTypes = {
  operator: PropTypes.any.isRequired
};

OperatorTile.defaultProps = {
  operator: null
};

export default OperatorTile;
