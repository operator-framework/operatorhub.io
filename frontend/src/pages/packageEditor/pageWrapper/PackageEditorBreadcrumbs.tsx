import React from 'react';
import { History } from 'history';
import { Breadcrumb } from 'patternfly-react';


export interface BreadcrumbsItem {
    subpath: string,
    label: string | React.ReactElement,
    onClick?: () => void
}

const BaseItems: BreadcrumbsItem[] = [
    {
        subpath: '/',
        label: 'Home'
    },
    {
        subpath: '/packages',
        label: <span>Packages<span className="oh-beta-label">BETA</span></span>
    }
]

export interface PackageEditorBreadcrumbsProps {
    history: History,
    items: BreadcrumbsItem[]
}

const PackageEditorBreadcrumbs: React.FC<PackageEditorBreadcrumbsProps> = ({
    history,
    items

}) => {
    // start from packages
    let currentPath = BaseItems[1].subpath;

    // map items so they contain full path instead of segment
    const pathItems = items.reduce((aggregator, item) => {
        currentPath += '/' + item.subpath;

        aggregator.push({
            ...item,
            subpath: currentPath           
        });

        return aggregator;
    }, [...BaseItems]);

    return (
        <Breadcrumb>
            {
                pathItems.map((item, index, array) => {
                    const active = index === array.length - 1;

                    return (
                        <Breadcrumb.Item
                            key={item.subpath}
                            onClick={e => {
                                e.preventDefault();

                                item.onClick && item.onClick();                                
                                !active && history.push(item.subpath);
                            }}
                            href={item.subpath}
                            active={active}
                        >
                            {item.label}
                        </Breadcrumb.Item>
                    )
                })
            }
        </Breadcrumb>
    )
};

export default PackageEditorBreadcrumbs;