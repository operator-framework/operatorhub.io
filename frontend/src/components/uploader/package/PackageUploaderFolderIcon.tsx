import React from 'react';
import { Icon } from 'patternfly-react';

export enum PackageUploaderFolderIconStatus {
  CLOSED = 'folder-close',
  OPENED = 'folder-open'
};

export interface PackageUploaderFolderIconProps{
  status: PackageUploaderFolderIconStatus
}

/**
 * Upload result icon with type of 'success' or 'failure' or 'missing
 */
const  PackageUploaderFolderIcon: React.FC<PackageUploaderFolderIconProps> = ({ status }) => {
  return (
    <span className="oh-operator-editor-upload__uploads__folder">
      <Icon type="pf" name={status} />
    </span>
  );
}



export default PackageUploaderFolderIcon;
