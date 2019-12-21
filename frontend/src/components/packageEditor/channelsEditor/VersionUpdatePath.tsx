import React from 'react';

import { PackageEditorUpdatePath } from '../../../utils/packageEditorTypes';

const ROW_HEIGHT = 56;
const WIDTH = 30;
const DIAMETER = 8;


export interface UpdatePathProps {
    index: number
    distance: number
    sortingDirection: 'asc' | 'desc',
}

const UpdatePath: React.FC<UpdatePathProps> = ({ index, distance, sortingDirection }) => {

    const rotatation = sortingDirection === 'desc' ? 'rotate(90deg)' : 'rotate(-90deg)';
    const width = distance * ROW_HEIGHT;
    const widthPx = width + 'px';
    const leftPx = (WIDTH * index) + 'px';    

    return (
        <div className="oh-package-channels-editor__update-graph__wrapper"
            style={{ width: widthPx, left: leftPx, transform: rotatation }}>
            <div className="oh-package-channels-editor__update-graph__start">&nbsp;</div>
            <div
                className="oh-package-channels-editor__update-graph__line"
                style={{ width: widthPx }}
            >&nbsp;</div>
            <div
                className="oh-package-channels-editor__update-graph__end"
                style={{ left: (width - DIAMETER) + 'px' }}
            >&nbsp;</div>
        </div>
    );
}

export default UpdatePath;
