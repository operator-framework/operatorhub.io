import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import { Icon } from 'patternfly-react';

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
    const { history, objectPage, objectType } = this.props;

    event.preventDefault();
    history.push(`/editor/${objectPage}/Add ${objectType}`);
  };

  editOperatorObject = operatorObject => {
    const { history, objectPage } = this.props;
    history.push(`/editor/${objectPage}/${operatorObject.name}`);
  };

  removeOperatorObject = (event, operatorObject) => {
    const { onUpdate } = this.props;
    const { operatorObjects } = this.state;

    event.preventDefault();

    const updatedObjects = operatorObjects.filter(nextObject => nextObject !== operatorObject);
    this.setState({ operatorObjects: updatedObjects });

    onUpdate(updatedObjects);
  };

  renderObject = (operatorObject, index) => {
    const { objectTitleField } = this.props;

    return (
      <div key={index} className="oh-operator-editor__list__item">
        <h3>{_.get(operatorObject, objectTitleField)}</h3>
        <div className="oh-operator-editor__list__item__actions">
          <button className="oh-operator-editor-page__section__edit-button" onClick={() => this.editOperatorObject(operatorObject)}>
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
    const { title, fieldTitle, objectType } = this.props;
    const { operatorObjects } = this.state;

    return (
      <div className="oh-operator-editor__list">
        <h2>{title}</h2>
        {_.size(operatorObjects) > 0 && (
          <React.Fragment>
            <span className="oh-tiny">{fieldTitle}</span>
            <div className="oh-operator-editor__list__items-container">
              {_.map(operatorObjects, (operatorObject, index) => this.renderObject(operatorObject, index))}
            </div>
          </React.Fragment>
        )}
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
  onUpdate: PropTypes.func.isRequired,
  objectPage: PropTypes.string.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

ListObjectEditor.defaultProps = {
  operator: {}
};

export default ListObjectEditor;
