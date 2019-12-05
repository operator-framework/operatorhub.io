import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { Icon } from 'patternfly-react';

import { EDITOR_STATUS } from '../../utils/constants';
import { History } from 'history';
import { StoreState } from '../../redux';

export type EditorSectionProps = {
  history: History,
  title: React.ReactNode,
  description: React.ReactNode,
  sectionLocation: string
} & ReturnType<typeof mapStateToProps>

const EditorSection : React.FC<EditorSectionProps> = ({ sectionStatus, title, description, sectionLocation, history }) => {
  const status: keyof typeof EDITOR_STATUS = _.get(sectionStatus, sectionLocation);

  const onEdit = () => {
    const pathname = history.location.pathname;
    const sectionPath = pathname +  (pathname.endsWith('/') ? sectionLocation : `/${sectionLocation}`);

    history.push(sectionPath);
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
  title: PropTypes.node.isRequired,
  description: PropTypes.node.isRequired,
  sectionLocation: PropTypes.string.isRequired,
  history: PropTypes.any.isRequired,
  sectionStatus: PropTypes.any
};

EditorSection.defaultProps = {
  sectionStatus: {} as any
};

const mapStateToProps = (state: StoreState) => ({
  sectionStatus: state.editorState.sectionStatus
});

export default connect(mapStateToProps)(EditorSection);
