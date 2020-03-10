export interface GenericOperatorChannel<T> {
    name: string,
    latestCsvName: string,
    csvNamesList: {
        name: string,
        version: string
    }[],
    csvFiles: T[]
}

export interface GenericOperatorPackage<T> {
    name: string,
    channelsList: Readonly<GenericOperatorChannel<T>>[],
    defaultChannelName: string
}

export type OperatorLink = {
    name: string
    url: string
}

export type OperatorMaintainer = {
    name: string
    email: string
}


export interface AlmExample {
    kind: string
    [index: string]: any
}

export interface NormalizedCrd {
    name: string
    kind: string
    displayName: string
    description: string
    yamlExample: AlmExample | null
}

export interface NormalizedOperator {
    name: string
    displayName: string
    imgUrl: string
    thumbUrl: string
    longDescription: string
    provider: string
    version: string
    versionForCompare: string
    replaces: string
    capabilityLevel: string
    links: OperatorLink[]
    repository: string
    maintainers: OperatorMaintainer[]
    managedBy: string
    helmRepoName: string
    helmRepoUrl: string
    helmChart: string
    description: string
    categories: string[]
    keywords: string[]
    createdAt: string
    containerImage: string
    customResourceDefinitions: any
    packageName: string,
    channel: string,
    globalOperator: boolean
}

export type OperatorDetail = {
    operator: NormalizedOperator & {
        channels: OperatorDetailChannelList[]
    }
}

export type NormalizedOperatorChannel = Readonly<GenericOperatorChannel<Readonly<NormalizedOperator>>>;
export type NormalizedOperatorPackage = Readonly<GenericOperatorPackage<Readonly<NormalizedOperator>>>;

export interface OperatorIndexMetadata {
    name: string
    displayName: string
    imgUrl: string,
    provider: string,
    capabilityLevel: string,
    description: string,
    categories: string[],
    keywords: string[],
    packageName: string
}

export interface OperatorDetailChannelList {
    name: string,
    currentCSV: string,
    versions: {
        name: string,
        version: string
    }[]
}

export interface OperatorsIndex {
    operators: OperatorIndexMetadata[]
}
