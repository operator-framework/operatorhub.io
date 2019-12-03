import React from 'react';
import { History } from 'history';

export interface EditorButtonBarProps {
    history: History
    title: React.ReactNode
    versionEditorRootPath: string
    secondary?: boolean
    lastPageSubPath?: string
    lastPageTitle?: string
    tertiary?: boolean
    pageHasErrors: boolean
    onAllSet: () => boolean
}

const EditorButtonBar: React.FC<EditorButtonBarProps> = ({
    history,
    lastPageSubPath,
    title,
    versionEditorRootPath,
    lastPageTitle,
    secondary,
    tertiary,
    pageHasErrors,
    onAllSet
}) => {

    const onBack = (e: React.MouseEvent) => {
        e.preventDefault();
        history.push(`${versionEditorRootPath}/${lastPageSubPath}`);
    };

    const onEditor = (e: React.MouseEvent) => {
        e.preventDefault();
        history.push(versionEditorRootPath);
    };

    const allSet = (e: React.MouseEvent) => {
        e.preventDefault();

        const navigate = onAllSet();

        navigate && secondary ? onEditor(e) : onBack(e);        
    };

    return (
        <React.Fragment>
            {(secondary && (
                <div className="oh-operator-editor-page__button-bar">
                    <button className="oh-button oh-button-secondary" onClick={onEditor}>
                        Back to Package your Operator
                  </button>
                    <button className="oh-button oh-button-primary" disabled={pageHasErrors} onClick={allSet}>
                        {`All set with ${title}`}
                    </button>
                </div>
            ))}
            {(tertiary && (
                <div className="oh-operator-editor-page__button-bar__tertiary">
                    <button className="oh-button oh-button-primary" onClick={onBack}>
                        {`Back to ${lastPageTitle}`}
                    </button>
                </div>
            ))}
        </React.Fragment>
    )
};

EditorButtonBar.defaultProps = {
    lastPageSubPath: '',
    secondary: false,
    lastPageTitle: '',
    tertiary: false,    
    pageHasErrors: false
}

export default EditorButtonBar;