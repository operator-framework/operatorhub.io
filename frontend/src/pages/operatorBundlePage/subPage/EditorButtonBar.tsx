import React from 'react';
import { History } from 'history';

export interface EditorButtonBarProps {
    history: History
    title: React.ReactNode
    secondary?: boolean
    lastPageSubPath?: string
    lastPageTitle?: string
    tertiary?: boolean
    pageHasErrors: boolean
    onAllSet: (e: React.MouseEvent) => void
}

const EditorButtonBar: React.FC<EditorButtonBarProps> = ({
    history,
    lastPageSubPath,
    title,
    lastPageTitle,
    secondary,
    tertiary,
    pageHasErrors,
    onAllSet
}) => {

    const onBack = e => {
        e.preventDefault();
        history.push(`/bundle/${lastPageSubPath}`);
    };

    const onEditor = e => {
        e.preventDefault();
        history.push(`/bundle`);
    };

    return (
        <React.Fragment>
            {(secondary && (
                <div className="oh-operator-editor-page__button-bar">
                    <button className="oh-button oh-button-secondary" onClick={onEditor}>
                        Back to Package your Operator
                  </button>
                    <button className="oh-button oh-button-primary" disabled={pageHasErrors} onClick={onAllSet}>
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