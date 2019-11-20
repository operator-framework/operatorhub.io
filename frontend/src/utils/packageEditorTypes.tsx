export interface PackageFileEntry {
    kind: 'file';
    path: string;
    name: string;
    objectName: string;
    objectType: string;
    content: any;
    nested: boolean;
    opened?: boolean;
    errored?: boolean
}
export interface PackageDirectoryEntry {
    kind: 'dir';
    path: string;
    name: string;
    objectName: '/';
    objectType: string,
    nested: boolean;
    content: PackageEntry[];
    opened?: boolean;
    errored?: boolean;
}
export type PackageEntry = PackageDirectoryEntry | PackageFileEntry;
