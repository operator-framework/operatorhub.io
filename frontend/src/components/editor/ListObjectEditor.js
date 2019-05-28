import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import { Icon } from 'patternfly-react';
import { helpers } from '../../common/helpers';

class ListObjectEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = { operatorObjects: this.getOperatorObjects() };
  }

  componentDidUpdate(prevProps) {
    const { operator } = this.props;
    if (operator !== prevProps.operator) {
      this.setState({ operatorObjects: this.getOperatorObjects() });
    }
  }

  getOperatorObjects = () => {
    const { operator, field } = this.props;

    return _.get(operator, field, []);
  };

  addOperatorObject = event => {
    const { history, objectPage, objectType, addName } = this.props;
    const addNamePath = addName || `Add ${objectType}`;

    event.preventDefault();
    history.push(`/bundle/${objectPage}/${addNamePath}`);
  };

  editOperatorObject = operatorObject => {
    const { history, objectPage, pagePathField } = this.props;
    const transformedName = helpers.transformNameForPath(_.get(operatorObject, pagePathField));
    history.push(`/bundle/${objectPage}/${transformedName}`);
  };

  removeOperatorObject = (event, operatorObject) => {
    const { onUpdate } = this.props;
    const { operatorObjects } = this.state;

    event.preventDefault();

    const updatedObjects = operatorObjects.filter(nextObject => nextObject !== operatorObject);
    this.setState({ operatorObjects: updatedObjects });

    onUpdate(updatedObjects);
  };

  renderObject = (operatorObject, errors, index) => {
    const { objectTitleField } = this.props;
    const title = _.get(operatorObject, objectTitleField);
    const error = _.find(errors, { index });

    if (!title) {
      return null;
    }

    return (
      <div key={index} className="oh-operator-editor__list__item">
        <h3>{title}</h3>
        <div className="oh-operator-editor__list__item__actions">
          {error && (
            <span className="oh-operator-editor-page__section__status">
              <Icon type="fa" name="minus-circle" />
              Invalid Entries
            </span>
          )}
          <button className="oh-button oh-button-secondary" onClick={() => this.editOperatorObject(operatorObject)}>
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
    const { operatorObjects } = this.state;
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
  operator: PropTypes.object,
  field: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  objectType: PropTypes.string.isRequired,
  fieldTitle: PropTypes.string.isRequired,
  objectTitleField: PropTypes.string.isRequired,
  pagePathField: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
  objectPage: PropTypes.string.isRequired,
  addName: PropTypes.string,
  formErrors: PropTypes.object.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

ListObjectEditor.defaultProps = {
  operator: {},
  pagePathField: 'name',
  addName: null
};

export default ListObjectEditor;
