import * as React from 'react';
import PropTypes from 'prop-types';
import { TypeAheadSelect } from 'patternfly-react';
import { getOptionLabel } from 'react-bootstrap-typeahead/lib/utils';

import { noop } from '../../common';

/**
 * Select with search and option to add new tags
 * @param {object} param0
 * @param {string} param0.id
 * @param {string[]=} param0.values
 * @param {string[]=} param0.options
 * @param {boolean} [param0.isMulti=true]
 * @param {boolean} [param0.customSelect=false]
 * @param {string=} param0.placeholder
 * @param {boolean=} param0.dropup
 * @param {function=} param0.onChange
 * @param {function=} param0.onBlur
 * @param {function=} param0.onValueEdit
 * @param {string} [param0.initialValue]
 * @param {string} [param0.labelKey]
 * @param {string=} [param0.newSelectionPrefix]
 * @param {function} [param0.customSelectValidator]
 */
const EditorSelect = ({
  id,
  values,
  options,
  isMulti,
  customSelect,
  placeholder,
  initialValue,
  onValueEdit,
  dropup,
  onChange,
  onBlur,
  newSelectionPrefix,
  labelKey,
  customSelectValidator
}) => {
  let typeAhead = null;

  // when leaving the select, clear out any left over text that isn't a selection
  const typeAheadBlur = event => {
    if (typeAhead && !initialValue) {
      const currentText = typeAhead.getInstance().state.text;

      if (currentText && options.includes(currentText) && !values.includes(currentText)) {
        let updatedValues;
        if (isMulti) {
          updatedValues = [...values, currentText];
        } else {
          updatedValues = [currentText];
        }
        onChange(updatedValues);
      }

      const inputEvent = new Event('input', { bubbles: true });
      typeAhead.getInstance().setState({ text: '' });
      typeAhead.getInstance().props.onInputChange('', inputEvent);
    }

    setTimeout(() => onBlur(event), 10);
  };

  /**
   * Allow editing values in order to add custom values.
   * Awailable only for multiselect and when onValue edit callback is defined
   * @param {*} props
   * @param {*} option
   */
  const editOption = (props, option) => {
    if (typeAhead && isMulti && onValueEdit !== noop) {
      const instance = typeAhead.getInstance();
      const label = getOptionLabel(option, props.labelKey);

      const updatedValues = [...values.filter(value => value !== label)];
      onChange(updatedValues);

      const inputEvent = new Event('input', { bubbles: true });
      instance.setState({ text: label });
      instance.props.onInputChange(label, inputEvent);

      onValueEdit && onValueEdit(label);
    }
  };

  /**
   * Convert custom values to standard string values before passing them to callback
   * @param {*} selections
   */
  const _onChange = selections => {
    const flattenedSelections = selections.map(selection => getOptionLabel(selection, labelKey));
    onChange(flattenedSelections);
  };
  return (
    <div className="oh-operator-editor-form__select">
      <TypeAheadSelect
        id={id}
        multiple={isMulti}
        options={options}
        selected={values}
        allowNew={customSelectValidator || customSelect}
        dropup={dropup}
        placeholder={placeholder}
        defaultInputValue={initialValue}
        autofocus={!!initialValue}
        onChange={_onChange}
        onBlur={typeAheadBlur}
        positionFixed
        newSelectionPrefix={newSelectionPrefix}
        renderToken={(option, properties, index) => (
          <TypeAheadSelect.Token
            key={index}
            onRemove={properties.onRemove}
            onMouseUp={e => {
              // trigger edit only if token is clicked, but not for delete btn...
              if (e._dispatchInstances === e._targetInst) {
                editOption(properties, option);
              }
            }}
          >
            {getOptionLabel(option, properties.labelKey)}
          </TypeAheadSelect.Token>
        )}
        ref={ref => {
          typeAhead = ref;
        }}
      />
    </div>
  );
};

EditorSelect.propTypes = {
  id: PropTypes.string.isRequired,
  values: PropTypes.array,
  options: PropTypes.array,
  labelKey: PropTypes.string,
  isMulti: PropTypes.bool,
  customSelect: PropTypes.bool,
  dropup: PropTypes.bool,
  initialValue: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  newSelectionPrefix: PropTypes.string,
  customSelectValidator: PropTypes.func,
  onValueEdit: PropTypes.func
};

EditorSelect.defaultProps = {
  values: [],
  options: [],
  isMulti: true,
  customSelect: false,
  dropup: false,
  labelKey: 'label',
  placeholder: 'Select options',
  onChange: noop,
  onBlur: noop,
  initialValue: '',
  newSelectionPrefix: undefined,
  customSelectValidator: undefined,
  onValueEdit: noop
};

export default EditorSelect;
