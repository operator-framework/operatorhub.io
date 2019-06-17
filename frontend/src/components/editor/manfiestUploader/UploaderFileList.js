import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Icon } from 'patternfly-react';
import UploaderStatusIcon, { IconStatus } from './UploaderStatusIcon';

/**
 * List uploaded and missing files
 * @param {*} param0
 */
function UploaderFileList({ uploads, missingUploads, removeUpload, removeAllUploads }) {
  if (uploads.length === 0 && missingUploads.length === 0) {
    return null;
  }
  return (
    <Grid fluid className="oh-operator-editor-upload__uploads">
      <Grid.Row className="oh-operator-editor-upload__uploads__row">
        <Grid.Col xs={6}>File Name</Grid.Col>
        <Grid.Col xs={3}>Status</Grid.Col>
        <Grid.Col xs={3} className="oh-operator-editor-upload__uploads__actions-col">
          <a href="#" onClick={removeAllUploads}>
            <Icon type="fa" name="trash" />
            <span>Remove All</span>
          </a>
        </Grid.Col>
      </Grid.Row>
      {uploads.map(upload => (
        <Grid.Row className="oh-operator-editor-upload__uploads__row" key={upload.index}>
          <Grid.Col xs={6}>{upload.uploadFile}</Grid.Col>
          <Grid.Col xs={3}>
            <UploaderStatusIcon text={upload.status} status={upload.errored ? IconStatus.ERROR : IconStatus.SUCCESS} />
          </Grid.Col>
          <Grid.Col xs={3} className="oh-operator-editor-upload__uploads__actions-col">
            <a href="#" onClick={e => removeUpload(e, upload.index)}>
              <Icon type="fa" name="trash" />
              <span className="sr-only">Remove</span>
            </a>
          </Grid.Col>
        </Grid.Row>
      ))}
      {missingUploads.map(missing => (
        <Grid.Row className="oh-operator-editor-upload__uploads__row" key={missing.name}>
          <Grid.Col xs={6}>{missing.name}</Grid.Col>
          <Grid.Col xs={3}>
            <UploaderStatusIcon status={IconStatus.MISSING} text="Missing CRD" />
          </Grid.Col>
          <Grid.Col xs={3} className="oh-operator-editor-upload__uploads__actions-col" />
        </Grid.Row>
      ))}
    </Grid>
  );
}

UploaderFileList.propTypes = {
  uploads: PropTypes.arrayOf(
    PropTypes.shape({
      index: PropTypes.number.isRequired,
      uploadFile: PropTypes.string.isRequired,
      data: PropTypes.object,
      errored: PropTypes.bool.isRequired,
      status: PropTypes.string.isRequired
    })
  ).isRequired,
  missingUploads: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired
    })
  ),
  removeUpload: PropTypes.func.isRequired,
  removeAllUploads: PropTypes.func.isRequired
};

UploaderFileList.defaultProps = {
  missingUploads: []
};

export default UploaderFileList;
