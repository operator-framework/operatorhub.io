import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import classNames from 'classnames';
import { Icon } from 'patternfly-react';
import { operatorFieldDescriptions, operatorFieldValidators } from '../../utils/operatorDescriptors';

class LabelsEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = { labels: this.getOperatorLabels() };
  }

  componentDidUpdate(prevProps) {
    const { operator } = this.props;
    if (operator !== prevProps.operator) {
      this.setState({ labels: this.getOperatorLabels() });
    }
  }

  isEmptyLabel = label => {
    const { keyField, valueField } = this.props;
    return label[keyField] === '' && label[valueField] === '';
  };

  areLabelsEmpty = () => {
    const { labels } = this.state;

    return labels.length === 1 && this.isEmptyLabel(labels[0]);
  };

  createNewLabel = (key, value) => {
    const { keyField, valueField } = this.props;

    const newLabel = {};
    _.set(newLabel, keyField, key);
    _.set(newLabel, valueField, value);

    return newLabel;
  };

  getOperatorLabels = () => {
    const { operator, field, isPropsField } = this.props;
    const labels = _.get(this.state, 'labels');

    const emptyLabels = _.filter(labels, label => this.isEmptyLabel(label));

    let currentLabels = _.get(operator, field);
    if (isPropsField) {
      if (currentLabels) {
        currentLabels = _.map(_.keys(currentLabels), key => this.createNewLabel(key, currentLabels[key]));
      }
    }

    if (!currentLabels) {
      currentLabels = [];
    }

    const operatorLabels = _.filter(currentLabels, label => !this.isEmptyLabel(label));

    operatorLabels.push(...emptyLabels);

    if (_.isEmpty(operatorLabels)) {
      operatorLabels.push(this.createNewLabel('', ''));
    }

    return operatorLabels;
  };

  addOperatorLabel = event => {
    const { labels } = this.state;

    event.preventDefault();
    const newLabels = [...labels, this.createNewLabel('', '')];
    this.setState({ labels: newLabels });
  };

  onFieldBlur = label => {
    const { onUpdate, keyField, valueField } = this.props;
    const { labels } = this.state;

    if (label[keyField] && label[valueField]) {
      onUpdate(labels);
    }
  };

  updateOperatorLabel = (operatorLabel, key, value) => {
    const { keyField, valueField } = this.props;

    _.set(operatorLabel, keyField, key);
    _.set(operatorLabel, valueField, value);
    this.forceUpdate();
  };

  removeOperatorLabel = (event, operatorLabel) => {
    const { onUpdate } = this.props;
    const { labels } = this.state;

    event.preventDefault();

    if (!this.areLabelsEmpty()) {
      const updatedLabels = labels.filter(label => label !== operatorLabel);
      if (_.isEmpty(updatedLabels)) {
        updatedLabels.push(this.createNewLabel('', ''));
      }
      this.setState({ labels: updatedLabels });

      onUpdate(updatedLabels);
    }
  };

  renderLabel = (operatorLabel, index) => {
    const { field, keyField, keyPlaceholder, valueField, valuePlaceholder, formErrors } = this.props;
    const removeLabelClass = classNames('remove-label', { disabled: this.areLabelsEmpty() });

    const errors = this.isEmptyLabel(operatorLabel) ? [] : _.get(formErrors, field, []);
    const fieldErrors = _.find(errors, { key: operatorLabel[keyField], value: operatorLabel[valueField] });

    const keyError = _.get(fieldErrors, 'keyError');
    const valueError = _.get(fieldErrors, 'valueError');
    const keyClasses = classNames('form-group col-sm-6', { 'oh-operator-editor-form__field--error': keyError });
    const valueClasses = classNames('form-group col-sm-6', { 'oh-operator-editor-form__field--error': valueError });

    return (
      <div key={index} className="oh-operator-editor-form__field row">
        <div className={keyClasses}>
          <input
            className="form-control"
            type="text"
            value={operatorLabel[keyField]}
            onChange={e => this.updateOperatorLabel(operatorLabel, e.target.value, operatorLabel[valueField])}
            onBlur={() => this.onFieldBlur(operatorLabel)}
            placeholder={keyPlaceholder}
            {..._.get(operatorFieldValidators, `${field}.${keyField}.props`)}
          />
          {keyError && <div className="oh-operator-editor-form__error-block">{keyError}</div>}
        </div>
        <div className={valueClasses}>
          <div className="oh-operator-editor-form__label-value-col">
            <input
              className="form-control"
              type="text"
              value={operatorLabel[valueField]}
              onChange={e => this.updateOperatorLabel(operatorLabel, operatorLabel[keyField], e.target.value)}
              onBlur={() => this.onFieldBlur(operatorLabel)}
              placeholder={valuePlaceholder}
              {..._.get(operatorFieldValidators, `${field}.${valueField}.props`)}
            />
            <a href="#" className={removeLabelClass} onClick={e => this.removeOperatorLabel(e, operatorLabel)}>
              <Icon type="fa" name="trash" />
              <span className="sr-only">Remove Label</span>
            </a>
          </div>
          {valueError && <div className="oh-operator-editor-form__error-block">{valueError}</div>}
        </div>
      </div>
    );
  };

  render() {
    const { title, singular, field, keyLabel, valueLabel, formErrors } = this.props;
    const { labels } = this.state;
    const labelsError = _.get(formErrors, field, []);

    return (
      <React.Fragment>
        <h3>{title}</h3>
        <p>{_.get(operatorFieldDescriptions, field)}</p>
        <div className="oh-operator-editor-form__field row">
          <span className="col-sm-6">{keyLabel}</span>
          <span className="col-sm-6">{valueLabel}</span>
        </div>
        {_.map(labels, (operatorLabel, index) => this.renderLabel(operatorLabel, index))}
        <div className="oh-operator-editor__list__adder">
          <a href="#" className="oh-operator-editor-form__label-adder" onClick={e => this.addOperatorLabel(e)}>
            <Icon type="fa" name="plus-circle" />
            <span>{`Add ${singular}`}</span>
          </a>
        </div>
        {_.isString(labelsError) && <div className="oh-operator-editor-form__error-block">{labelsError}</div>}
      </React.Fragment>
    );
  }
}

LabelsEditor.propTypes = {
  operator: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  singular: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  keyField: PropTypes.string,
  keyLabel: PropTypes.string,
  keyPlaceholder: PropTypes.string,
  valueField: PropTypes.string,
  valueLabel: PropTypes.string,
  valuePlaceholder: PropTypes.string,
  isPropsField: PropTypes.bool,
  formErrors: PropTypes.object
};

LabelsEditor.defaultProps = {
  keyField: 'key',
  keyLabel: 'Key',
  keyPlaceholder: 'e.g. KEY',
  valueField: 'value',
  valueLabel: 'Value',
  valuePlaceholder: 'e.g. VALUE',
  isPropsField: false,
  formErrors: {}
};

export default LabelsEditor;
