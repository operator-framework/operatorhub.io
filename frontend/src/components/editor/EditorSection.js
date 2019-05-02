import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import { Icon } from 'patternfly-react';
import { EDITOR_STATUS } from '../../pages/operatorBundlePage/bundlePageUtils';

const EditorSection = ({ sectionStatus, title, description, sectionLocation, history }) => {
  const status = _.get(sectionStatus, sectionLocation);

  const onEdit = () => {
    history.push(`/bundle/${sectionLocation}`);
  };

  const renderSectionStatus = () => {
    if (status === EDITOR_STATUS.errors) {
      return (
        <React.Fragment>
          <Icon type="fa" name="minus-circle" />
          Invalid Entries
        </React.Fragment>
      );
    }
    if (status === EDITOR_STATUS.complete) {
      return (
        <React.Fragment>
          <Icon type="fa" name="check-circle" />
          Completed
        </React.Fragment>
      );
    }
    if (status === EDITOR_STATUS.pending) {
      return (
        <React.Fragment>
          <Icon type="fa" name="warning" />
          Pending Review
        </React.Fragment>
      );
    }

    return null;
  };

  return (
    <div className="oh-operator-editor-page__section">
      <div className="oh-operator-editor-page__section__header">
        <div className="oh-operator-editor-page__section__header__text">
          <h3>{title || ''}</h3>
          {description && <p>{description}</p>}
        </div>
        <div className="oh-operator-editor-page__section__status">
          {renderSectionStatus()}
          {!status || status === EDITOR_STATUS.empty ? (
            <button className="oh-button oh-button-primary" onClick={onEdit}>
              Start
            </button>
          ) : (
            <button className="oh-button oh-button-secondary" onClick={onEdit}>
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

EditorSection.propTypes = {
  sectionStatus: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  sectionLocation: PropTypes.string.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

EditorSection.defaultProps = {
  sectionStatus: {}
};

const mapStateToProps = state => ({
  sectionStatus: state.editorState.sectionStatus
});

export default connect(mapStateToProps)(EditorSection);
