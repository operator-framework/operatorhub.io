import * as React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'patternfly-react/dist/js/components/Label';
import { Card, CardBody, CardFooter, CardHeading, CardTitle } from 'patternfly-react';
import * as operatorImg from '../imgs/operator.svg';

function getTagStrings(tags) {
  return (tags.map(tag => (
    <Label className="ks-card__footer__tag" bsStyle="primary">
      {tag}
    </Label>
  )))
}

const OperatorTile = ({ operator, ...props }) => {
  if (!operator) {
    console.log('not an operator');
    return null;
  }

  const { name, tags, imgUrl, author, tagline } = operator;
  const vendor = author ? `provided by ${author}` : null;

  const tagStrings = tags ? getTagStrings(tags) : null;

  return (
    <Card className="ks-card">
      <CardHeading className="ks-card__heading">
        <div className="ks-card__heading__left">
          <CardTitle className="ks-card__heading__left__title">{name}</CardTitle>
          <span className="ks-card__heading__left__provider">{vendor}</span>
        </div>
        <img className="ks-card__heading__logo" alt={name} src={imgUrl || operatorImg} />
      </CardHeading>
      <CardBody className="ks-card__body">
        <div className="ks-card__body__description">{tagline}</div>
      </CardBody>
      <CardFooter className="ks-card__footer">{tagStrings}</CardFooter>
    </Card>
  );
};

OperatorTile.propTypes = {
  operator: PropTypes.object
};

OperatorTile.defaultProps = {
  operator: null
};

export default OperatorTile;
