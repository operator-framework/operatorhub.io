import * as React from 'react';
import * as _ from 'lodash-es';
import classNames from 'classnames';

import {
  operatorFieldDescriptions,
  operatorFieldPlaceholders,
  operatorFieldValidators
} from '../../utils/operatorDescriptors';
import { getFieldValueError } from '../../utils/operatorUtils';

const EDITOR_STATUS = {
  empty: 'empty',
  pending: 'pending',
  complete: 'complete',
  errors: 'errors'
};

const renderFormError = (field, formErrors) => {
  const error = _.get(formErrors, field);
  if (!error) {
    return null;
  }
  return <div className="oh-operator-editor-form__error-block">{error}</div>;
};

const renderOperatorInput = (title, field, inputComponent, formErrors) => {
  const formFieldClasses = classNames({
    'oh-operator-editor-form__field': true,
    row: true,
    'oh-operator-editor-form__field--error': _.get(formErrors, field)
  });

  return (
    <div className={formFieldClasses}>
      <div className="form-group col-sm-6">
        <label htmlFor={field}>{title}</label>
        {inputComponent}
        {renderFormError(field, formErrors)}
      </div>
      <div className="oh-operator-editor-form__description col-sm-6">{_.get(operatorFieldDescriptions, field, '')}</div>
    </div>
  );
};

const renderOperatorFormField = (operator, formErrors, updateOperator, commitField, title, field, fieldType) => {
  let inputComponent;

  if (fieldType === 'text-area') {
    inputComponent = (
      <textarea
        id={field}
        className="form-control"
        rows={3}
        {..._.get(_.get(operatorFieldValidators, field), 'props')}
        onChange={e => updateOperator(e.target.value, field)}
        onBlur={() => commitField(field)}
        value={_.get(operator, field, '')}
        placeholder={_.get(operatorFieldPlaceholders, field)}
      />
    );
  } else {
    inputComponent = (
      <input
        id={field}
        className="form-control"
        type={fieldType}
        {..._.get(_.get(operatorFieldValidators, field), 'props')}
        onChange={e => updateOperator(e.target.value, field)}
        onBlur={() => commitField(field)}
        value={_.get(operator, field, '')}
        placeholder={_.get(operatorFieldPlaceholders, field)}
      />
    );
  }

  return renderOperatorInput(title, field, inputComponent, formErrors);
};

const updateStoredFormErrors = (operator, formErrors, fields, storeEditorFormErrors) => {
  const fieldsArray = _.castArray(fields);
  const updatedFormErrors = _.clone(formErrors);
  _.forEach(fieldsArray, field => {
    const error = getFieldValueError(operator, field);
    _.set(updatedFormErrors, field, error);
  });
  storeEditorFormErrors(updatedFormErrors);

  return updatedFormErrors;
};

export { renderOperatorInput, renderOperatorFormField, renderFormError, EDITOR_STATUS, updateStoredFormErrors };
