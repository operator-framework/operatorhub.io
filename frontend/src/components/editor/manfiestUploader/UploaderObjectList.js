import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Icon } from 'patternfly-react';
import UploaderStatusIcon, { IconStatus } from './UploaderStatusIcon';

/**
 * List uploaded and missing files
 * @param {Object} param0
 * @param {UploadMetadata[]} param0.uploads
 * @param {MissingCRD[]} param0.missingUploads
 * @param {*} param0.removeUpload
 * @param {*} param0.removeAllUploads
 */
function UploaderObjectList({ uploads, missingUploads, removeUpload, removeAllUploads }) {
  if (uploads.length === 0 && missingUploads.length === 0) {
    return null;
  }
  return (
    <Grid fluid className="oh-operator-editor-upload__uploads">
      <Grid.Row className="oh-operator-editor-upload__uploads__row">
        <Grid.Col xs={3}>Object Name</Grid.Col>
        <Grid.Col xs={3}>File Name</Grid.Col>
        <Grid.Col xs={3}>Object Type</Grid.Col>
        <Grid.Col xs={2}>Status</Grid.Col>
        <Grid.Col xs={1} className="oh-operator-editor-upload__uploads__actions-col">
          <a href="#" onClick={removeAllUploads}>
            <Icon type="fa" name="trash" />
            <span>Remove All</span>
          </a>
        </Grid.Col>
      </Grid.Row>
      {uploads.map(upload => (
        <Grid.Row className="oh-operator-editor-upload__uploads__row" key={upload.id}>
          <Grid.Col
            xs={3}
            className={`oh-operator-editor-upload__uploads__row__name ${
              upload.overwritten ? 'upload__overwritten' : ''
            }`}
            title={upload.name}
          >
            {upload.name}
          </Grid.Col>
          <Grid.Col xs={3} className="oh-operator-editor-upload__uploads__row__file" title={upload.fileName}>
            {upload.fileName}
          </Grid.Col>
          <Grid.Col xs={3} className="oh-operator-editor-upload__uploads__row__type" title={upload.type}>
            {upload.type}
          </Grid.Col>
          <Grid.Col xs={2}>
            <UploaderStatusIcon text={upload.status} status={upload.errored ? IconStatus.ERROR : IconStatus.SUCCESS} />
          </Grid.Col>
          <Grid.Col xs={1} className="oh-operator-editor-upload__uploads__actions-col">
            <a href="#" onClick={e => removeUpload(e, upload.id)}>
              <Icon type="fa" name="trash" />
              <span className="sr-only">Remove</span>
            </a>
          </Grid.Col>
        </Grid.Row>
      ))}
      {missingUploads.map(missing => (
        <Grid.Row className="oh-operator-editor-upload__uploads__row" key={missing.name}>
          <Grid.Col xs={6} className="oh-operator-editor-upload__uploads__row__name" title={missing.name}>
            {missing.name}
          </Grid.Col>
          <Grid.Col xs={3} className="oh-operator-editor-upload__uploads__row__type" title="CustomResourceDefinition">
            CustomResourceDefinition
          </Grid.Col>
          <Grid.Col xs={2}>
            <UploaderStatusIcon status={IconStatus.MISSING} text="Missing" />
          </Grid.Col>
          <Grid.Col xs={1} className="oh-operator-editor-upload__uploads__actions-col" />
        </Grid.Row>
      ))}
    </Grid>
  );
}

UploaderObjectList.propTypes = {
  uploads: PropTypes.arrayOf(
    PropTypes.shape({
      fileName: PropTypes.string.isRequired,
      data: PropTypes.object,
      errored: PropTypes.bool.isRequired,
      status: PropTypes.string.isRequired,
      overwritten: PropTypes.bool.isRequired,
      id: PropTypes.string.isRequired
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

UploaderObjectList.defaultProps = {
  missingUploads: []
};

export default UploaderObjectList;
