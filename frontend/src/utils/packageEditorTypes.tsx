export interface PackageFileEntry {
    type: 'file';
    path: string;
    name: string;
    objectName: string;
    content: string;
    nested: boolean;
    opened?: boolean;
}
export interface PackageDirectoryEntry {
    type: 'dir';
    path: string;
    name: string;
    objectName: '/';
    nested: boolean;
    opened?: boolean;
    content: PackageEntry[];
}
export type PackageEntry = PackageDirectoryEntry | PackageFileEntry;
