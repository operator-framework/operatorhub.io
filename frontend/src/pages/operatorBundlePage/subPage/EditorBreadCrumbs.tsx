import React from 'react';
import { History } from 'history';

import PackageEditorBreadcrumbs, { BreadcrumbsItem } from '../../packageEditor/pageWrapper/PackageEditorBreadcrumbs';


export interface EditorBreadcrumbsProps {
    history: History
    currentLabel?: string | React.ReactElement
    versionEditorRootPath: string
    sectionSubPath?: string
    sectionLabel?: string
}

const EditorBreadcrumbs: React.FC<EditorBreadcrumbsProps> = ({
    history,
    sectionSubPath,
    currentLabel,
    sectionLabel,
    versionEditorRootPath
}) => { 
    const items: BreadcrumbsItem[] = [];

    // add middleware items which defines package / channel / version
    // shared for entire version editor
    // omit base pacakges path as they are already provided by Package editor
    const baseItems = versionEditorRootPath.replace('/packages/', '').split('/');

    baseItems.forEach(item => {
        items.push({
            label: item,
            subpath: item
        })
    });

    // add nested section path
    sectionSubPath && sectionLabel && items.push({
        subpath: sectionSubPath,
        label: sectionLabel
    });

    // add active subsection name
    currentLabel && items.push({
        subpath: '',
        label: currentLabel
    });

    return (
        <PackageEditorBreadcrumbs
            history={history}
            items={items}
        />
    );
};


export default EditorBreadcrumbs;