/* eslint-disable no-undef */
import React from 'react';
import _ from 'lodash-es';
import PropTypes from 'prop-types';

import { operatorFieldPlaceholders, operatorFieldDescriptions } from '../../../utils/operatorDescriptors';
import OperatorInputWrapper from './OperatorInputWrapper';
import { helpers } from '../../../common/helpers';
import { operatorFieldValidators } from '../../../utils/operatorValidators';

/**
 * Create input wrapped into Operator Editor styling
 * @param {object} param0
 * @param {string} param0.title
 * @param {string} param0.field
 * @param {string} param0.inputType
 * @param {*} param0.formErrors
 * @param {import('./OperatorInputWrapper').CommitOperatorFieldFromInputCallback} param0.commitField
 * @param {string} param0.defaultValue
 * @param {Function=} [param0.refCallback]
 * @param {*} [param0.descriptions]
 */
const OperatorInputUncontrolled = ({
  title,
  field,
  inputType,
  formErrors,
  commitField,
  defaultValue,
  refCallback,
  descriptions
}) => (
  <OperatorInputWrapper title={title} field={field} formErrors={formErrors} descriptions={descriptions}>
    <input
      id={field}
      className="form-control"
      type={inputType}
      {..._.get(_.get(operatorFieldValidators, field), 'props')}
      onBlur={e => commitField(field, e.target.value)}
      placeholder={_.get(operatorFieldPlaceholders, field)}
      defaultValue={defaultValue}
      ref={refCallback}
    />
  </OperatorInputWrapper>
);

OperatorInputUncontrolled.propTypes = {
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  inputType: PropTypes.string.isRequired,
  formErrors: PropTypes.any.isRequired,
  commitField: PropTypes.func.isRequired,
  defaultValue: PropTypes.string.isRequired,
  refCallback: PropTypes.func,
  descriptions: PropTypes.object
};

OperatorInputUncontrolled.defaultProps = {
  refCallback: helpers.noop,
  descriptions: operatorFieldDescriptions
};

export default OperatorInputUncontrolled;
