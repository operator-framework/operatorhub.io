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

export type PackageEditorOperatorVersionMetadata = {
    name: string,
    csv: Operator,
    crdUploads: {
        name: string,
        crd: any
    }[]
};

export type PackageEditorOperatorVersionsMap = Record<string, PackageEditorOperatorVersionMetadata>;

export type PacakgeEditorChannel = {
    name: string,
    isDefault: boolean,
    versions: string[],
    currentVersion: string,
    currentVersionFullName: string
}