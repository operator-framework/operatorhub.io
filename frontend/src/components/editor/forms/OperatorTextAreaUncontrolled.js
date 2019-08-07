import React from 'react';
import _ from 'lodash-es';
import PropTypes from 'prop-types';

import {
  operatorFieldValidators,
  operatorFieldPlaceholders,
  operatorFieldDescriptions
} from '../../../utils/operatorDescriptors';
import OperatorInputWrapper from './OperatorInputWrapper';
import { helpers } from '../../../common/helpers';

/**
 * Create input wrapped into Operator Editor styling
 * @param {object} param0
 * @param {string} param0.title
 * @param {string} param0.field
 * @param {string} param0.defaultValue
 * @param {*} param0.formErrors
 * @param {import('./OperatorInputWrapper').CommitOperatorFieldFromInputCallback} param0.commitField
 * @param {Function=} [param0.refCallback]
 * @param {*} [param0.descriptions]
 */
const OperatorTextAreaUncontrolled = ({
  title,
  field,
  defaultValue,
  formErrors,
  commitField,
  refCallback,
  descriptions
}) => (
  <OperatorInputWrapper title={title} field={field} formErrors={formErrors} descriptions={descriptions}>
    <textarea
      id={field}
      className="form-control"
      rows={3}
      {..._.get(_.get(operatorFieldValidators, field), 'props')}
      onBlur={e => commitField(field, e.target.value)}
      placeholder={_.get(operatorFieldPlaceholders, field)}
      defaultValue={defaultValue}
      ref={refCallback}
    />
  </OperatorInputWrapper>
);

OperatorTextAreaUncontrolled.propTypes = {
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  formErrors: PropTypes.any.isRequired,
  commitField: PropTypes.func.isRequired,
  defaultValue: PropTypes.string.isRequired,
  refCallback: PropTypes.func,
  descriptions: PropTypes.object
};

OperatorTextAreaUncontrolled.defaultProps = {
  refCallback: helpers.noop,
  descriptions: operatorFieldDescriptions
};

export default OperatorTextAreaUncontrolled;
