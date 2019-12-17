import { Operator } from "./operatorTypes";

export interface PackageFileEntry {
    kind: 'file';
    path: string;
    name: string;
    objectName: string;
    objectType: 'Package' | 'ClusterServiceVersion' | 'CustomResourceDefinition' | 'Unknown';
    content: any;
    nested: boolean;
    opened?: boolean;
    errored?: boolean;
    version: string;
    namePatternWithV?: boolean;
}
export interface PackageDirectoryEntry {
    kind: 'dir';
    path: string;
    name: string;
    objectName: '/';
    objectType: 'Folder',
    nested: boolean;
    content: PackageFileEntry[];
    opened?: boolean;
    errored?: boolean;
}
export type PackageEntry = PackageDirectoryEntry | PackageFileEntry;

export type PackageEditorOperatorVersionCrdMetadata = {
    name: string,
    crd: any
};

export type PackageEditorOperatorVersionMetadata = {
    name: string,
    version: string,
    csv: Operator,
    valid: boolean,
    crdUploads: PackageEditorOperatorVersionCrdMetadata[],
    namePatternWithV: boolean
};


export type PacakgeEditorChannel = {
    name: string,
    isDefault: boolean,
    versions: string[],
    currentVersion: string,
    currentVersionFullName: string
}