export type K8ObjectBase = {
    apiVersion: string
    kind: string
    metadata: {
        name: string
    }
}

export type CustomResourceTemplateSpec = {
    spec: object
}

export type CustomResourceTemplateFile = K8ObjectBase & CustomResourceTemplateSpec;



export type CustomResourceFileSpec = {
    spec: {
        group: string
        names: {
            kind: string
            listKind: string
            plural: string
            singular: string
        }
        scope: string
        version: string
        validation: object
    }
}

export type CustomResourceFile = K8ObjectBase & CustomResourceFileSpec;


export type OperatorMetadataAnnotations = {
    'alm-examples': string
    categories: string
    certified: 'true' | 'false'
    createdAt: string
    description: string
    containerImage: string
    support: string
    capabilities: string
    repository: string
}

export type OperatorMetadata = {
    name: string
    namespace: string
    annotations: OperatorMetadataAnnotations
}


export type OperatorDescription = {
    aboutApplication: string
    aboutOperator: string
    prerequisites: string
}


export type OperatorMaintainer = {
    name: string
    email: string
}


export type OperatorProvider = {
    name: string
}


export type OperatorLink = {
    name: string
    url: string
}


export type OperatorIcon = {
    base64data: string
    mediatype: string
}


export type OperatorCrd = {
    name: string
    displayName: string
    kind: string
    version: string
    description: string
}

export type OperatorCrdResource = {
    version: string
    kind: string
}


export type OperatorCrdDescriptor = {
    id: string
    displayName: string
    description: string
    path: string
    'x-descriptors': string[]
}

export type OperatorOwnedCrdResources = {
    resources: OperatorCrdResource[]
    specDescriptors: OperatorCrdDescriptor[]
    statusDescriptors: OperatorCrdDescriptor[]
}

export type OperatorOwnedCrd = OperatorCrd & OperatorOwnedCrdResources;


export type OperatorPermissionRule = {
    apiGroup: string
    resources: string[]
    verb: string[]
}


export type OperatorPermission = {
    serviceAccountName: string
    rule: OperatorPermissionRule[]
}


export type OperatorInstall = {
    strategy: string
    spec: {
        permissions: OperatorPermission[]
        clusterPermissions: OperatorPermission[]
        deployments: any[]
    }
}


export type OperatorSpec = {
    displayName: string
    description: OperatorDescription
    maturity: string
    version: string
    replaces: string
    skips: string[]
    'olm.skipRange'?: string
    minKubeVersion: string
    keywords: string[]
    maintainers: OperatorMaintainer[]
    provider: OperatorProvider
    labels: Record<string, string>
    selector: {
        matchLabels: Record<string, string>
    }
    links: OperatorLink[]
    icon: OperatorIcon[]
    customresourcedefinitions: {
        owned: OperatorOwnedCrd[]
        required: OperatorCrd[]
    }
    install: OperatorInstall
    installModes: OperatorInstallModes
}

export type OperatorInstallMode = {
    type: string
    supported: boolean
}


export type OperatorInstallModes = OperatorInstallMode[];


export type Operator = {
    apiVersion: 'operators.coreos.com/v1alpha1',
    kind: 'ClusterServiceVersion'
    metadata: OperatorMetadata
    spec: OperatorSpec
}

export type OperatorPackage = {
    name: string
    channel: string
}

export type NormalizedVersion = {
    name: string
    version: string
}

export type NormalizedOperatorChannel = {
    name: string
    versions: NormalizedVersion[]
    currentCSV: string
}

export type NormalizedCrdPreview = {
    name: string
    kind: string
    displayName: string
    description: string
    yamlExample: object | null
}

export type NormalizedOperatorPreview = {
    id: string
    name: string
    displayName: string
    description: string
    imgUrl: string
    longDescription: string
    provider: string
    version: string
    versionForCompare: string
    capabilityLevel: string
    links: OperatorLink[]
    repository: string
    maintainers: OperatorMaintainer[]
    managedBy?: string
    helmRepoName?: string
    helmRepoUrl?: string
    helmChart?: string
    categories: string[]
    createdAt: string
    containerImage: string
    customResourceDefinitions: NormalizedCrdPreview[]
    packageName: string
    channels: NormalizedOperatorChannel[]
    channel?: string
    globalOperator: boolean
}