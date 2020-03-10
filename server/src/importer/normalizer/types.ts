import { OperatorLink, OperatorMaintainer } from "../../sharedTypes"

export type OperatorMetadataAnnotations = {
    'alm-examples': string,
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


export type OperatorProvider = {
    name: string
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


export type OperatorOwnedCrd = OperatorCrd & OperatorOwnedCrdResources & {
    resources: OperatorCrdResource[]
}


export type OperatorPermissionRule = {
    apiGroup: string
    resources: string[]
    verbs: string[]
}


export type OperatorPermission = {
    serviceAccountName: string
    rules: OperatorPermissionRule[]
}


export type OperatorInstall = {
    strategy: string
    spec: {
        permissions: OperatorPermission[]
        clusterPermissions: OperatorPermission[]
        deployments: []
    }
}


export type OperatorSpec = {
    displayName: string
    description: string
    maturity: string
    version: string
    replaces: string
    minKubeVersion: string
    keywords: string[]
    maintainers: OperatorMaintainer[]
    managedBy : string
    helmRepoName: string
    helmRepoUrl: string
    helmChart: string
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
    installModes: OperatorInstallMode[]
}


export type OperatorInstallMode = {
    type: string
    supported: boolean
}

export type Operator = {
    apiVersion: string
    kind: 'ClusterServiceVersion'
    metadata: OperatorMetadata
    spec: OperatorSpec
}
