export type ObjectType = 'Package' | 'ClusterServiceVersion' | 'CustomResourceDefinition' | 'Deployment' |
    'ServiceAccount' | 'ClusterRole' | 'Role' | 'ClusterRoleBinding' | 'RoleBinding' | 'CustomResourceExampleTemplate' | 'Unknown';

export type TypeAndName = {
    type: ObjectType
    name: string
}

export type UploadMetadata = {
    id: string
    name: string
    fileName: string
    data: any
    type: ObjectType
    errored: boolean
    status: string
    overwritten: boolean
}

export type MissingCRD = {
    name: string
}

export type KubernetesObject = {
    apiVersion: string
    kind: string
    metadata: {
        name: string
    }
}

type RoleObject = {
    rules: any
}

export type KubernetesRoleObject = KubernetesObject & RoleObject;

type RoleBindingSubject = {
    kind: string
    name: string
}

type RoleBindingObject = {
    subjects: RoleBindingSubject[]
    roleRef: {
        kind: string
        name: string
        apiGroup: string
    }
}

export type KubernetsRoleBindingObject = KubernetesObject & RoleBindingObject;
