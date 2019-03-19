import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import { Icon } from 'patternfly-react';
import { getFieldMissing, getFieldValueError } from '../../utils/operatorUtils';

class EditorSection extends React.Component {
  state = {
    started: false,
    completed: false,
    invalid: false
  };

  componentDidUpdate(prevProps) {
    const { operator } = this.props;

    if (!_.isEqual(operator, prevProps.operator)) {
      this.validateFields();
    }
  }

  toggleOpenState = event => {
    event.preventDefault();
    this.setState({ open: !this.state.open });
  };

  validateFields = () => {
    const { fields, operator } = this.props;
    const completed = _.every(fields, field => !getFieldMissing(operator, field));
    const started = _.some(fields, field => _.get(operator, field, '') !== '');
    const invalid = _.some(fields, field => getFieldValueError(operator, field));

    this.setState({ started, completed, invalid });
  };

  onEdit = () => {
    const { history, sectionLocation } = this.props;
    history.push(`/editor/${sectionLocation}`);
  };

  renderSectionStatus() {
    const { completed, invalid } = this.state;

    if (invalid) {
      return (
        <React.Fragment>
          <Icon type="fa" name="error-circle" />
          Invalid Entries
        </React.Fragment>
      );
    }
    if (completed) {
      return (
        <React.Fragment>
          <Icon type="fa" name="check-circle" />
          Complete
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <Icon type="fa" name="warning" />
        Incomplete
      </React.Fragment>
    );
  }

  render() {
    const { title, description } = this.props;
    const { started } = this.state;

    return (
      <div className="oh-operator-editor-page__section">
        <div className="oh-operator-editor-page__section__header">
          <div className="oh-operator-editor-page__section__header__text">
            <h3>{title || ''}</h3>
            {description && <p>{description}</p>}
          </div>
          <div className="oh-operator-editor-page__section__status">
            {this.renderSectionStatus()}
            {started ? (
              <button className="oh-operator-editor-page__section__edit-button" onClick={this.onEdit}>
                Edit
              </button>
            ) : (
              <button className="oh-operator-editor-page__section__edit-button primary" onClick={this.onEdit}>
                Start
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

EditorSection.propTypes = {
  operator: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  sectionLocation: PropTypes.string.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

export default EditorSection;
