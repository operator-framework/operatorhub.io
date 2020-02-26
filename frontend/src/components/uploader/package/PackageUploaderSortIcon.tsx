import React from 'react';
import { Icon } from 'patternfly-react';

export interface PackageUploaderSortIconProps{
  direction: 'asc' | 'desc'
}

/**
 * Upload result icon with type of 'success' or 'failure' or 'missing
 */
const  PackageUploaderSortIcon: React.FC<PackageUploaderSortIconProps> = ({direction}) => {
  return (
    <span className="oh-operator-editor-upload__uploads__sort">
      <Icon type="fa" name={`sort-alpha-${direction}`} />
    </span>
  );
}



export default PackageUploaderSortIcon;
