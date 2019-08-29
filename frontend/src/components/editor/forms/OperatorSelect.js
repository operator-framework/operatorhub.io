import React from 'react';
import _ from 'lodash-es';
import PropTypes from 'prop-types';

import { operatorFieldPlaceholders } from '../../../utils/operatorDescriptors';
import OperatorInputWrapper from './OperatorInputWrapper';
import EditorSelect from '../EditorSelect';

/**
 * Update operator value while field is edited
 * @callback UpdaterOperatorFromSelectCallback
 * @param {string} field
 * @param {string[]} values
 */

/**
 * @callback CommitOperatorFieldFromSelectCallback
 * @param {string=} field
 */

/**
 * Create input wrapped into Operator Editor styling
 * @param {object} param0
 * @param {string} param0.title
 * @param {string} param0.field
 * @param {string[]} param0.values
 * @param {string[]} param0.options
 * @param {*} param0.formErrors
 * @param {boolean} [param0.isMulti]
 * @param {boolean} [param0.customSelect=false]
 * @param {string=} [param0.emptyLabel]
 * @param {string=} [param0.newSelectionPrefix]
 * @param {UpdaterOperatorFromSelectCallback} param0.updateOperator
 * @param {CommitOperatorFieldFromSelectCallback} param0.commitField
 */
const OperatorSelect = ({
  title,
  field,
  formErrors,
  values,
  options,
  isMulti,
  updateOperator,
  commitField,
  ...otherProps
}) => (
  <OperatorInputWrapper title={title} field={field} formErrors={formErrors}>
    <EditorSelect
      id={_.camelCase(field)}
      values={values}
      isMulti={isMulti}
      options={options}
      {...otherProps}
      placeholder={_.get(operatorFieldPlaceholders, field)}
      onChange={selection => updateOperator(field, selection)}
      onBlur={() => commitField(field)}
    />
  </OperatorInputWrapper>
);

OperatorSelect.propTypes = {
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
  formErrors: PropTypes.any.isRequired,
  isMulti: PropTypes.bool,
  customSelect: PropTypes.bool,
  newSelectionPrefix: PropTypes.string,
  emptyLabel: PropTypes.string,
  commitField: PropTypes.func.isRequired,
  updateOperator: PropTypes.func.isRequired
};

OperatorSelect.defaultProps = {
  isMulti: true,
  customSelect: false,
  emptyLabel: undefined,
  newSelectionPrefix: undefined
};

export default OperatorSelect;
