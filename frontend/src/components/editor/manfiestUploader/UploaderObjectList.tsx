import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Icon } from 'patternfly-react';
import UploaderStatusIcon, { IconStatus } from './UploaderStatusIcon';
import { UploadMetadata, MissingCRD } from './UploaderTypes';

export interface UploaderObjectListProps {
  uploads: UploadMetadata[]
  missingUploads: MissingCRD[]
  removeUpload: (e: React.MouseEvent, id: string) => void
  removeAllUploads: (e: React.MouseEvent) => void
}

/**
 * List uploaded and missing files
 */
const UploaderObjectList: React.FC<UploaderObjectListProps> = ({ uploads, missingUploads, removeUpload, removeAllUploads }) => {
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
      {missingUploads.map((missing, index) => (
        <Grid.Row className="oh-operator-editor-upload__uploads__row" key={`${missing.name}_${index}`}>
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
  uploads: PropTypes.arrayOf(PropTypes.any).isRequired,
  missingUploads: PropTypes.arrayOf(PropTypes.any).isRequired,
  removeUpload: PropTypes.func.isRequired,
  removeAllUploads: PropTypes.func.isRequired
};

UploaderObjectList.defaultProps = {
  missingUploads: []
};

export default UploaderObjectList;
