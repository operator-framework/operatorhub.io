import React from 'react';
import { Nav, NavItem, TabContainer } from 'patternfly-react';
 

export interface CreatePackagePageHeaderProps {
    title: string
    desc: React.ReactNode
    activeTab: number
    onNavSelect: (activeTab: number) => void
}

const CreatePackagePageHeader: React.FC<CreatePackagePageHeaderProps> = ({ title, desc, activeTab, onNavSelect }) => {

    return (
        <React.Fragment>
            <h1>{title}</h1>
            <p>{desc}</p>
            <TabContainer id="oh-operator-package-editor-tabs" defaultActiveKey={activeTab}>
                <Nav bsClass="nav nav-tabs nav-tabs-pf" onSelect={onNavSelect}>
                    <NavItem eventKey={1}>Create from Scratch</NavItem>
                    <NavItem eventKey={2}>Create from Existing Operator Package</NavItem>
                </Nav>
            </TabContainer>
        </React.Fragment>
    )
}

export default CreatePackagePageHeader;