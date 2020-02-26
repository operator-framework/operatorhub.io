import _ from 'lodash-es';

import { operatorFieldValidators, operatorPackageFieldValidators, KeyValueItemError } from './operatorValidators';
import { sectionsFields } from './constants';
import { Operator, OperatorPackage } from './operatorTypes';
import { isOwnedCrdDefault } from './operatorUtils';


/**
 * Validate key - value object type and return array of error objects
 */
const getObjectPropsErrors = (value: any, fieldValidator: FieldValidator, operator: Operator) => {

    const propErrors: KeyValueItemError[] = [];

    if (fieldValidator.required && _.isEmpty(value)) {
        return 'This field is required';
    }

    _.keys(value).forEach(key => {
        if (key || value[key]) {
            // check separately key and value
            const keyError = getValueError(key, _.get(fieldValidator, 'key'), operator);
            const valueError = getValueError(_.get(value, key), _.get(fieldValidator, 'value'), operator);

            if (keyError || valueError) {
                propErrors.push({ key, value: _.get(value, key), keyError, valueError });
            }
        }
    });

    return _.size(propErrors) ? propErrors : null;
};


export interface ArrayError {
    index: number
    errors: any
}

/**
 * Validates array of values and returns array of error objects
 */
const getArrayValueErrors = (value: any[], fieldValidator: FieldValidator, operator: Operator) => {
    const fieldErrors: ArrayError[] = [];

    (value || []).forEach((nextValue, index) => {
        const valueErrors = {};

        _.keys(fieldValidator.itemValidator).forEach(key => {
            const valueError = getValueError(nextValue[key], (fieldValidator.itemValidator as FieldValidator)[key], operator);
            if (valueError) {
                valueErrors[key] = valueError;
            }
        });
        if (!_.isEmpty(valueErrors)) {
            fieldErrors.push({ index, errors: valueErrors });
        }
    });

    if (_.size(fieldErrors)) {
        return fieldErrors;
    }

    return null;
};


export interface FieldValidator {
    isObjectProps?: boolean
    isArray?: boolean
    itemValidator?: Record<string, FieldValidator>
    required?: boolean
    requiredError?: string
    validator?: Function
    contextualValidator?: Function
    isEmpty?: Function
    regex?: RegExp
}

/**
 * Validates single value
 */
export const getValueError = (value: any, fieldValidator: FieldValidator, operator: Operator) => {
    if (!fieldValidator) {
        return null;
    }

    if (fieldValidator.isObjectProps) {
        return getObjectPropsErrors(value, fieldValidator, operator);
    }

    if (fieldValidator.isArray) {
        if (fieldValidator.required && _.isEmpty(value)) {
            return fieldValidator.requiredError || 'At least one value is required.';
        }
        return getArrayValueErrors(value, fieldValidator, operator);
    }

    if (fieldValidator.contextualValidator) {
        return fieldValidator.contextualValidator(value, operator, fieldValidator);
    }

    if (_.isEmpty(value)) {
        return fieldValidator.required ? 'This field is required' : null;
    }

    if (fieldValidator.regex) {
        if (!fieldValidator.regex.test(value)) {
            return _.get(fieldValidator, 'regexErrorMessage');
        }
    }

    if (fieldValidator.validator) {
        return fieldValidator.validator(value);
    }

    return null;
};

/**
 * Validates field at defined path in operator
 */
export const getFieldValueError = (operator: Operator, field: string | string[]) => {
    const value = _.get(operator, field);
    const fieldValidator = _.get(operatorFieldValidators, field);

    return getValueError(value, fieldValidator, operator);
};

/**
 * Check validity of the operator part at defined path
 */
const areSubFieldValid = (operatorSubSection, validators, path: string[], operator: Operator): boolean => {

    const error = _.find(_.keys(validators), key => {

        const fieldValue = operatorSubSection[key];
        const fieldPath = path.concat([key]);
        const validator: FieldValidator = validators[key];

        if (getValueError(fieldValue, validator, operator)) {
            console.log(`${fieldPath.join('.')}:`, getValueError(fieldValue, validator, operator));
            return true;
        }

        if (!_.isObject(validator) || !_.isObject(fieldValue)) {
            return false;
        }

        // array or key-value pairs are already deeply validated by "getValueError" method
        if (validator.isArray || validator.isObjectProps) {
            // validator = validator.itemValidator;
            return false;
        }

        // props is used for extended validation data, not a nested field :/
        if (key !== 'props') {
            return !areSubFieldValid(fieldValue, validator, fieldPath, operator);
        }
        return false;
    });

    return !error;
};

/**
 * Takes error object or array or error message
 * And checks if contains error messages
 */
export const containsErrors = (formErrors: any): boolean => {
    // no value or null
    if (typeof formErrors === 'undefined' || formErrors === null) {
        return false;
    } else if (typeof formErrors === 'string') {
        return true;
    } else if (typeof formErrors === 'object') {
        return Object.values(formErrors).some(error => containsErrors(error));
    }
    return false;
};

/**
 * Removes empty values which are part of default operator,
 * but should not be part of final operator as they are invalid
 */
export const removeEmptyOptionalValuesFromOperator = (operator: Operator) => {
    const clonedOperator = _.cloneDeep(operator);

    const ownedCRDs = _.get(clonedOperator, sectionsFields['owned-crds'], []).filter(crd => !isOwnedCrdDefault(crd));
    _.set(clonedOperator, sectionsFields['owned-crds'], ownedCRDs);

    return clonedOperator;
};

/**
 * Validates operator package field
 */
export const validateOperatorPackageField = (value: string, fieldName: string) =>
    getValueError(value, _.get(operatorPackageFieldValidators, fieldName), {} as any);

/**
 * Validatates operator package
 */
export const validateOperatorPackage = (operatorPackage: OperatorPackage) => {
    const FIELDS = ['name', 'channel'];

    return FIELDS.every(field => validateOperatorPackageField(operatorPackage[field], field) === null);
};
