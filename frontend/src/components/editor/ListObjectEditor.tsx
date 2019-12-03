import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { Icon } from 'patternfly-react';
import { History } from 'history';

import { transformNameForPath } from '../../common';
import { Operator } from '../../utils/operatorTypes';

export interface ListObjectEditorProps {
  history: History
  operator: Operator
  field: string,
  title: string,
  objectType: string,
  fieldTitle: string,
  objectTitleField: string,
  formErrors: any
  sectionPath: string,
  objectSubtitleField?: string,
  pagePathField?: string,
  onUpdate: (updatedObjects, operatorObject) => void
}

class ListObjectEditor extends React.PureComponent<ListObjectEditorProps> {

  static propTypes;
  static defaultProps;

  /**
   * @returns {*[]}
   */
  getOperatorObjects = () => {
    const { operator, field } = this.props;

    return _.get(operator, field) || [];
  };

  addOperatorObject = event => {
    const { history, sectionPath } = this.props;

    event.preventDefault();
    history.push(`${sectionPath}/add`);
  };

  editOperatorObject = (operatorObject, index) => {
    const { history, sectionPath, pagePathField = 'name' } = this.props;
    const transformedName = transformNameForPath(_.get(operatorObject, pagePathField, ''));

    history.push(`${sectionPath}/edit/${index}/${transformedName}`);
  };

  removeOperatorObject = (event: React.MouseEvent, operatorObject) => {
    const { onUpdate } = this.props;

    event.preventDefault();

    const updatedObjects = this.getOperatorObjects().filter(nextObject => nextObject !== operatorObject);
    onUpdate(updatedObjects, operatorObject);
  };

  renderObject = (operatorObject, errors, index) => {
    const { objectTitleField, objectSubtitleField = '' } = this.props;
    const title = _.get(operatorObject, objectTitleField) || ' ';
    const subtitle = _.get(operatorObject, objectSubtitleField) || ' ';
    const error = _.find(errors, { index });

    return (
      <div key={index} className="oh-operator-editor__list__item">
        <h3>
          {title}
          {objectSubtitleField && <span className="oh-operator-editor__list__item__subtitle">({subtitle})</span>}
        </h3>
        <div className="oh-operator-editor__list__item__actions">
          {error && (
            <span className="oh-operator-editor-page__section__status">
              <Icon type="fa" name="minus-circle" />
              Invalid Entries
            </span>
          )}
          <button
            className="oh-button oh-button-secondary"
            onClick={() => this.editOperatorObject(operatorObject, index)}
          >
            Edit
          </button>
          <a href="#" onClick={e => this.removeOperatorObject(e, operatorObject)}>
            <Icon type="fa" name="trash" />
            <span className="sr-only">Remove</span>
          </a>
        </div>
      </div>
    );
  };

  render() {
    const { title, fieldTitle, objectType, formErrors, field } = this.props;
    const operatorObjects = this.getOperatorObjects();
    const errors = _.get(formErrors, field);

    return (
      <div className="oh-operator-editor__list">
        <h2>{title}</h2>
        {_.size(operatorObjects) > 0 && (
          <React.Fragment>
            <span className="oh-tiny">{fieldTitle}</span>
            <div className="oh-operator-editor__list__items-container">
              {_.map(operatorObjects, (operatorObject, index) => this.renderObject(operatorObject, errors, index))}
            </div>
          </React.Fragment>
        )}
        {typeof errors === 'string' && <div className="oh-operator-editor-form__error-block">{errors}</div>}
        <div className="oh-operator-editor__list__adder">
          <a href="#" className="oh-operator-editor-form__label-adder" onClick={e => this.addOperatorObject(e)}>
            <Icon type="fa" name="plus-circle" />
            <span>{`Add ${objectType}`}</span>
          </a>
        </div>
      </div>
    );
  }
}

ListObjectEditor.propTypes = {
  operator: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  objectType: PropTypes.string.isRequired,
  fieldTitle: PropTypes.string.isRequired,
  objectTitleField: PropTypes.string.isRequired,
  objectSubtitleField: PropTypes.string,
  pagePathField: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
  sectionPath: PropTypes.string.isRequired,
  formErrors: PropTypes.object.isRequired,
  history: PropTypes.any.isRequired
};

ListObjectEditor.defaultProps = {
  operator: {},
  objectSubtitleField: '',
  pagePathField: 'name'
};

export default ListObjectEditor;
