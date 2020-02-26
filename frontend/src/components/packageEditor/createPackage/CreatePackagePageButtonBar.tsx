import React from 'react';

export interface CreatePackagePageButtonBarProps {
    valid: boolean
    onCreate: (e: React.MouseEvent) => void
    onClear: (e: React.MouseEvent) => void
}

const CreatePackagePageButtonBar: React.FC<CreatePackagePageButtonBarProps> = ({ valid, onCreate, onClear }) => {

    return (
        <div className="oh-operator-package-editor-page__button-bar">
            <button className="oh-button oh-button-primary" disabled={!valid} onClick={onCreate}>
                Create
    </button>
            <button className="oh-button oh-button-secondary" onClick={onClear}>
                Clear
  </button>
        </div>
    )
}

export default CreatePackagePageButtonBar;