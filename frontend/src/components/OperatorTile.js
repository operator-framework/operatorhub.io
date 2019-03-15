import * as React from 'react';
import PropTypes from 'prop-types';
import { CatalogTile } from 'patternfly-react-extensions';
import * as operatorImg from '../imgs/operator.svg';

const OperatorTile = ({ operator, ...props }) => {
  if (!operator) {
    return null;
  }

  const { name, displayName, imgUrl, provider, description } = operator;
  const vendor = provider ? `provided by ${provider}` : null;

  return (
    <CatalogTile
      id={name}
      title={displayName}
      iconImg={imgUrl || operatorImg}
      vendor={vendor}
      description={description}
      {...props}
    />
  );
};

OperatorTile.propTypes = {
  operator: PropTypes.object
};

OperatorTile.defaultProps = {
  operator: null
};

export default OperatorTile;
