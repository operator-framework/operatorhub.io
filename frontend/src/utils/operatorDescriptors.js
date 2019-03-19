/* eslint-disable no-template-curly-in-string */
import * as React from 'react';

const operatorFieldDescriptions = {
  metadata: {
    annotations: {
      capabilities: 'The level of capabilities provided by this Operator.',
      categories: 'A list of categories that you Operator falls into. Used for categorization within compatible UIs.',
      description:
        'A summary of functionality provided by this Operator. Used for displaying as the headline of the Operator within compatible UIs. This description is limited to 135 characters.',
      containerImage:
        'The repository that hosts the operator image. The format should match ${REGISTRYHOST}/${USERNAME}/${NAME}:${TAG}',
      repository: "Optional. The URL operator's source code repository."
    }
  },
  spec: {
    displayName: 'A short, readable name for the operator.',
    description: `A markdown blob that describes the Operator. Important information to include: features, limitations
     and common use-cases for the Operator. If your Operator manages different types of installs, e.g. standalone vs
     clustered, it is useful to give an overview of how each differs from the others, or which ones are supported for
     production use.`,
    icon: (
      <span>
        A base 64 encoded image of the Operator logo or the logo of the publisher. The{' '}
        <span className="oh-code">base64data</span> parameter contains the data and the{' '}
        <span className="oh-code">mediatype</span> specifies the type of image, e.g.{' '}
        <span className="oh-code">image/png</span> or <span className="oh-code">image/svg+xml</span>.
      </span>
    ),
    version:
      'The semantic version of the Operator. This value should be incremented each time a new Operator image is published.',
    maturity: 'The stability of the Operator.',
    replaces:
      "The name of the CSV that will be replaced by this latest version (naming scheme is 'Operator name + semantic version number', e.g. 'etcdoperator.v0.9.0').",
    MinKubeVersion:
      "A minimum version of Kubernetes the server should have for the operator(s) to be deployed. The Kubernetes version must be in the format: 'Major.Minor.Patch'.",
    maintainers:
      'A list of names and email addresses of the maintainers of the Operator code. This can be a list of individuals or a shared email alias.',
    provider: {
      name: 'The name of the publishing entity behind the Operator.'
    },
    links:
      'A list of relevant links for the Operator. Common links include documentation, how-to guides, blog posts, and the company homepage.',
    keywords: 'A list of words that relate to your operator. These are used when searching for operators in the UI',
    installModes: (
      <span>
        A set of InstallModes that tell OLM which OperatorGroups an Operator can belong to. Belonging to an
        OperatorGroup means that OLM provides the set of targeted namespaces as an annotation on the Operator{`'`}s CSV
        and any deployments defined therein. These deployments can then utilize the Downward API to inject the list of
        namespaces into its container(s).
      </span>
    ),
    install: {
      spec: {
        deployments: 'Describe the deployment that will be started within the desired namespace',
        permissions: (
          <span>
            Describe the <code>permissions</code> or <code>clusterPermissions</code> required to successfully run the
            Operator. Ensure that the <code>serviceAccountName</code> used in the <code>deployment</code> spec matches
            one of the Roles described under <code>permissions</code>.
          </span>
        )
      }
    },
    labels: <span>Any key/value pairs used to organize this Cluster Service Version (CSV) object.</span>,
    selector: {
      matchLabels:
        'A list of label selectors to identify related resources. Set this to select on current labels applied to this CSV object (if applicable).'
    },
    customresourcedefinitions: {
      owned: `The CRDs owned by your Operator are the most important part of your CSV. This establishes the link
      between your Operator and hte required RBAC rules, dependency management and other under-the-hood
      Kubernetes concepts`,
      required: `Relying on other "required" CRDs is completely optional and only exists to reduce the scope of
         individual Operators and provide a way to compose multiple Operators together to solve an end-to-end use case.`
    }
  }
};

const capabilityDescriptions = [
  'Automated application provisioning and configuration management',
  'Patch and minor version upgrades supported',
  'App Lifecycle, storage lifecycle (backup, failure recovery)',
  'Metrics, alerts, log processing and workload analysis',
  'Horizontal/vertical scaling, auto config tuning, abnormal detection, scheduling tuning'
];

const installModeDescriptors = {
  OwnNamespace: 'If supported, the operator can be a member of an OperatorGroup that selects its own namespace.',
  SingleNamespace: 'If supported, the operator can be a member of an OperatorGroup that selects one namespace.',
  AllNamespaces: 'If supported, the operator can be a member of an OperatorGroup that selects all namespaces.',
  MultiNamespace: 'If supported, the operator can be a member of an OperatorGroup that selects more than one namespace.'
};

const categoryOptions = [
  {
    value: 'AI/Machine Learning',
    label: 'AI/Machine Learning'
  },
  {
    value: 'Big Data',
    label: 'Big Data'
  },
  {
    value: 'Cloud Provider',
    label: 'Cloud Provider'
  },
  {
    value: 'Database',
    label: 'Database'
  },
  {
    value: 'Integration & Delivery',
    label: 'Integration & Delivery'
  },
  {
    value: 'Logging & Tracing',
    label: 'Logging & Tracing'
  },
  {
    value: 'Monitoring',
    label: 'Monitoring'
  },
  {
    value: 'Networking',
    label: 'Networking'
  },
  {
    value: 'OpenShift Optional',
    label: 'OpenShift Optional'
  },
  {
    value: 'Security',
    label: 'Security'
  },
  {
    value: 'Storage',
    label: 'Storage'
  },
  {
    value: 'Streaming & Messaging',
    label: 'Streaming & Messaging'
  }
];

const operatorFieldPlaceholders = {
  metadata: {
    annotations: {
      description: 'resize this field with the grabber icon at the bottom right corner',
      containerImage: 'e.g. quay.io/example/example-operator:v0.0.1'
    }
  },
  spec: {
    displayName: 'e.g. My Operator',
    description: 'resize this field with the grabber icon at the bottom right corner',
    icon: 'drop your image here',
    version: 'e.g 0.0.2',
    maturity: 'e.g. alpha, beta, or stable',
    replaces: 'e.g. my-operator.v0.0.1',
    MinKubeVersion: 'e.g. 1.11.0',
    maintainers: {
      name: 'e.g. John Smith',
      email: 'e.g. john_smith@myhost.com'
    },
    provider: {
      name: 'e.g. ACME, Inc'
    },
    links: {
      name: 'e.g. Latest Operator Blog',
      url: 'e.g https://myoperatorsite.com/blog'
    }
  }
};

const operatorFieldValidators = {
  metadata: {
    name: {
      required: true
    },
    annotations: {
      capabilities: {
        required: true
      },
      description: {
        required: true,
        props: {
          maxLength: 135
        }
      }
    }
  },
  spec: {
    displayName: {
      required: true
    },
    description: {
      required: true
    },
    version: {
      required: true,
      regex: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/,
      regexErrorMessage: 'Must be in semantic version format (e.g 0.0.1 or v0.0.1)'
    },
    maturity: {
      required: true
    },
    maintainers: {
      required: true
    },
    icon: {
      required: true
    },
    installModes: {
      required: true
    },
    customresourcedefinitions: {
      required: true
    }
  }
};

export {
  operatorFieldDescriptions,
  capabilityDescriptions,
  categoryOptions,
  installModeDescriptors,
  operatorFieldPlaceholders,
  operatorFieldValidators
};
