import React from 'react';
import _ from 'lodash-es';
import PropTypes from 'prop-types';

import { operatorFieldValidators, operatorFieldPlaceholders } from '../../../utils/operatorDescriptors';
import OperatorInputWrapper from './OperatorInputWrapper';
import { helpers } from '../../../common/helpers';

/**
 * Create input wrapped into Operator Editor styling
 * @param {object} param0
 * @param {string} param0.title
 * @param {string} param0.field
 * @param {string|string[]|null} [param0.value]
 * @param {*} param0.formErrors
 * @param {import('./OperatorInputWrapper').UpdaterOperatorFromInputCallback} param0.updateOperator
 * @param {import('./OperatorInputWrapper').CommitOperatorFieldFromInputCallback} param0.commitField
 * @param {string|null} [param0.defaultValue]
 * @param {Function=} [param0.refCallback]
 */
const OperatorTextArea = ({ title, field, formErrors, value, updateOperator, commitField, refCallback }) => (
  <OperatorInputWrapper title={title} field={field} formErrors={formErrors}>
    <textarea
      id={field}
      className="form-control"
      rows={3}
      {..._.get(_.get(operatorFieldValidators, field), 'props')}
      onChange={e => updateOperator(e.target.value, field)}
      onBlur={e => commitField(field, e.target.value)}
      placeholder={_.get(operatorFieldPlaceholders, field)}
      value={value}
      ref={refCallback}
    />
  </OperatorInputWrapper>
);

OperatorTextArea.propTypes = {
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  formErrors: PropTypes.any.isRequired,
  commitField: PropTypes.func.isRequired,
  updateOperator: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  refCallback: PropTypes.func
};

OperatorTextArea.defaultProps = {
  refCallback: helpers.noop
};

export default OperatorTextArea;
