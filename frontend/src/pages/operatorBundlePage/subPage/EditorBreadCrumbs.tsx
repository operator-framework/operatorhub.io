import React from 'react';
import { History } from 'history';
import { Breadcrumb } from 'patternfly-react';


export interface EditorBreadcrumbsProps {
    history: History
    title: React.ReactNode
    secondary?: boolean
    sectionSubPath?: string
    sectionLabel?: string
    tertiary?: boolean
}

const EditorBreadcrumbs: React.FC<EditorBreadcrumbsProps> = ({
    history,
    sectionSubPath,
    title,
    sectionLabel,
    secondary,
    tertiary   
}) => {

    const onBack = e => {
        e.preventDefault();
        history.push(`/bundle/${sectionSubPath}`);
    };

    const onEditor = e => {
        e.preventDefault();
        history.push(`/bundle`);
    };

    const onHome = e => {
        e.preventDefault();
        history.push('/');
      };

    return (
        <Breadcrumb>
            <Breadcrumb.Item onClick={onHome} href={window.location.origin}>
                Home
                </Breadcrumb.Item>
            {(secondary || tertiary) && (
                <Breadcrumb.Item onClick={onEditor} href={`${window.location.origin}/bundle`}>
                    Package your Operator
                    <span className="oh-beta-label">BETA</span>
                </Breadcrumb.Item>
            )}
            {tertiary && (
                <Breadcrumb.Item onClick={onBack} href={`${window.location.origin}/bundle/${sectionSubPath}`}>
                    {sectionLabel}
                </Breadcrumb.Item>
            )}
            <Breadcrumb.Item active>{title}</Breadcrumb.Item>
        </Breadcrumb>
    )
};

EditorBreadcrumbs.defaultProps = {
    sectionSubPath: '',
    secondary: false,
    sectionLabel: '',
    tertiary: false
}

export default EditorBreadcrumbs;