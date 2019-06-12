/* eslint-disable no-template-curly-in-string */
import * as React from 'react';
import * as _ from 'lodash-es';

const nameRegExp = /^[a-z][a-z-]*[a-z]$/;
const nameRegExpMessage =
  'This field must begin and end with a lower case character with only dashes or lower case characters between.';

const versionRegExp = /^([v|V])?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/;

const kubeVersionRegExp = /^([v|V])(0|[1-9])+(alpha|beta)?(0|[1-9])*/;
const kubeVersionRegExpMessage =
  'Must start with a v, followed by a version number, and optionally a alpha or beta version';

const majorMinorPatchVersionRegExp = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/;

const urlRegExp = new RegExp(
  '^(?:(?:(?:https?|ftp):)?//)' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port
  '(\\?[;&amp;a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$',
  'i'
);

const emailRegExp = new RegExp(
  "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
);

const labelRegExp = /^[a-z0-9A-Z][a-z0-9A-Z-_.]*[a-z0-9A-Z]$/;
const labelRegExpMessage =
  'This field must begin and end with an alphanumeric character with dashes, underscores, dots, and alphanumerics between.';

const operatorFieldDescriptions = {
  metadata: {
    name: "Name of the operator's cluster service version.",
    annotations: {
      capabilities: 'The level of capabilities provided by this Operator.',
      categories: 'A list of categories that you Operator falls into. Used for categorization within compatible UIs.',
      description:
        'A summary of functionality provided by this Operator. Used for displaying as the headline of the Operator within compatible UIs. This description is limited to 135 characters.',
      containerImage:
        'The repository that hosts the operator image. The format should match ${REGISTRYHOST}/${USERNAME}/${NAME}:${TAG}',
      repository: "Optional. The URL operator's source code repository.",
      'alm-examples': (
        <span>
          Users of your Operator will need ot be aware of which options are required vs optional. You can provide
          templates for each of the owned CRDs with a minimum set of configuration as an annotation named{' '}
          <code>alm-examples</code>. Compatible UIs will pre-enter this template for users to further customize.
          <br />
          <br />
          The annotation consists of a list of the <code>kind</code>, e.g. the CRD name, and the corresponding{' '}
          <code>metadata</code> and <code>spec</code> of the Kubernetes object. If you uploaded your CRD templates with
          other operator manifests, CRD templates will be populated into the corresponding CRD fields.
        </span>
      )
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
    minKubeVersion:
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
        permissions: {
          serviceAccountName: 'The name of the Service Account being granted the permissions.'
        },
        clusterPermissions: {
          serviceAccountName: 'The name of the Service Account being granted the permissions.'
        }
      }
    },
    labels: <span>Any key/value pairs used to organize this Cluster Service Version (CSV) object.</span>,
    selector: {
      matchLabels:
        'A list of label selectors to identify related resources. Set this to select on current labels applied to this CSV object (if applicable).'
    },
    customresourcedefinitions: {
      owned: {
        displayName: 'A human readable version of your CRD name, e.g. "MongoDB Standalone".',
        description:
          'A short description of how this CRD is used by the Operator or a description of the functionality provided by the CRD.',
        kind: 'The machine readable name of your CRD.',
        name: 'The full name of your CRD, e.g. mongodbstandalones.mongodb.com.',
        version: 'The version of the object API.',
        resources: (
          <React.Fragment>
            Your CRDs will own one or more types of Kubernetes objects. These are listed in the resources section to
            inform your end-users of the objects they might need to troubleshoot or how to connect to the application,
            such as the Service or Ingress rule that exposes a database.
            <br />
            <br />
            {"It's"} recommended to only list out the objects what are important to a human, not an exhaustive list of
            everything you orchestrate. For example, ConfigMaps that store internal state that {"shouldn't"} be modified
            by a user {"shouldn't"} appear here.
            <br />
            <br />
            Please ensure that resources added here are appropriately tagged with <code>ownerReferences</code> by your
            Operator.
          </React.Fragment>
        ),
        descriptors: `These are a way to hint UIs with certain inputs or outputs of your Operator that are most important to an end
          user. If your CRD contains the name of a Secret or ConfigMap that the user must provide, you can specify that
          here. These items will be linked and highlited in compatible UIs.`
      },
      required: {
        displayName: 'A human readable version of the CRD name, e.g. etcd Cluster.',
        description:
          'A summary of how the component fits in your larger architecture, e.g. Represents a cluster of etcd nodes.',
        kind: 'The Kubernetes object kind.',
        name: 'The full name of the CRD you require, e.g. etcdclusters.etcd.database.coreos.com',
        version: 'The version of the object API.'
      }
    }
  }
};

const operatorObjectDescriptions = {
  spec: {
    customresourcedefinitions: {
      owned: {
        description: `The CRDs owned by your Operator are the most important part of your CSV. This establishes the link
        between your Operator and the required RBAC rules, dependency management and other under-the-hood
        Kubernetes concepts`
      },
      required: {
        description: `Relying on other "required" CRDs is completely optional and only exists to reduce the scope of
        individual Operators and provide a way to compose multiple Operators together to solve an end-to-end use case.`
      }
    },
    install: {
      spec: {
        permissions: {
          description: (
            <span>
              Describes the <code>permissions</code> required to successfully run the Operator. Ensure that the{' '}
              <code>serviceAccountName</code> used in the <code>deployment</code> spec matches one of the Roles
              described under <code>permissions</code>.
            </span>
          )
        },
        clusterPermissions: {
          description: (
            <span>
              Describes the <code>clusterPermissions</code> required to successfully run the Operator. Ensure that the{' '}
              <code>serviceAccountName</code> used in the <code>deployment</code> spec matches one of the Roles
              described under <code>clusterPermissions</code>.
            </span>
          )
        }
      }
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

const maturityOptions = ['planning', 'pre-alpha', 'alpha', 'beta', 'stable', 'mature', 'inactive', 'deprecated'];

const categoryOptions = [
  'AI/Machine Learning',
  'Big Data',
  'Cloud Provider',
  'Database',
  'Integration & Delivery',
  'Logging & Tracing',
  'Monitoring',
  'Networking',
  'OpenShift Optional',
  'Security',
  'Storage',
  'Streaming & Messaging'
];

const kindOptions = [
  'APIService',
  'CertificateSigningRequest',
  'ClusterRole',
  'ClusterRoleBinding',
  'ComponentStatus',
  'ConfigMap',
  'ControllerRevision',
  'CronJob',
  'CustomResourceDefinition',
  'DaemonSet',
  'Deployment',
  'Endpoints',
  'Event',
  'HorizontalPodAutoscaler',
  'Ingress',
  'Job',
  'Lease',
  'LimitRange',
  'LocalSubjectAccessReview',
  'MutatingWebhookConfiguration',
  'Namespace',
  'NetworkPolicy',
  'Node',
  'PersistentVolume',
  'PersistentVolumeClaim',
  'Pod',
  'PodDisruptionBudget',
  'PodSecurityPolicy',
  'PodTemplate',
  'PriorityClass',
  'ReplicaSet',
  'ReplicationController',
  'ResourceQuota',
  'Role',
  'RoleBinding',
  'Secret',
  'SelfSubjectAccessReview',
  'SelfSubjectRulesReview',
  'Service',
  'ServiceAccount',
  'StatefulSet',
  'StorageClass',
  'SubjectAccessReview',
  'TokenReview',
  'ValidatingWebhookConfiguration',
  'VolumeAttachment'
];

const operatorFieldPlaceholders = {
  metadata: {
    name: 'e.g. my-operator.v0.0.1',
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
    minKubeVersion: 'e.g. 1.11.0',
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
    },
    customresourcedefinitions: {
      owned: {
        name: 'e.g. mongodbstandalones.mongodb.com',
        version: 'e.g. v1beta2',
        kind: 'e.g. MongoDB',
        displayName: 'e.g. MongoDB Standalone',
        description: 'resize this field with the grabber icon at the bottom right corner.'
      },
      required: {
        name: 'e.g. etcdclusters.etcd.database.coreos.com',
        version: 'e.g. v1beta2',
        kind: 'e.g. EtcdCluster',
        displayName: 'e.g. etcd Cluster',
        description: 'resize this field with the grabber icon at the bottom right corner.'
      }
    }
  }
};

const linksValidator = links => {
  if (!links || _.isEmpty(links) || (links.length === 1 && !links[0].name && !links[0].url)) {
    return 'At least one external link is required.';
  }

  const linksErrors = [];
  _.forEach(links, link => {
    const nameError = link.name ? null : 'This field is required.';
    const urlError = urlRegExp.test(link.url) ? null : 'Must be a valid URL';
    if (nameError || urlError) {
      const error = {
        key: link.name,
        value: link.url,
        keyError: nameError,
        valueError: urlError
      };
      linksErrors.push(error);
    }
  });

  if (_.size(linksErrors)) {
    return linksErrors;
  }

  return null;
};

/**
 * Validates provider name using context of other fields
 * @param {string} value
 * @param {*} operator
 * @returns {string | null}
 */
const providerContextualValidator = (value, operator) => {
  const maintainers = _.get(operator, 'spec.maintainers');
  const maintainersValidatorObject = operatorFieldValidators.spec.maintainers;

  if (!maintainersValidatorObject.isEmpty(maintainers) || value) {
    return null;
  }

  return 'At least one provider or maintainer is required.';
};

const maintainersValidator = maintainers => {
  if (!maintainers || _.isEmpty(maintainers)) {
    return 'At least one maintainer is required.';
  }

  const maintainerErrors = [];
  _.forEach(maintainers, maintainer => {
    const nameError = maintainer.name ? null : 'This field is required.';
    const emailError = emailRegExp.test(maintainer.email) ? null : 'Must be a valid email address.';
    if (nameError || emailError) {
      const error = {
        key: maintainer.name,
        value: maintainer.email,
        keyError: nameError,
        valueError: emailError
      };
      maintainerErrors.push(error);
    }
  });

  if (_.size(maintainerErrors)) {
    return maintainerErrors;
  }

  return null;
};

/**
 * @typedef Maintainer
 * @prop {string} Maintainer.name
 * @prop {string} Maintainer.email
 */

/**
 * Validates fields in context of other fields to catch field cross dependancies
 * @param {Maintainer[]} value
 * @param {*} operator
 * @param {*} fieldValidator
 */
const maintainersContextualValidator = (value, operator, fieldValidator) => {
  const provider = _.get(operator, 'spec.provider.name');
  const { validator } = fieldValidator;

  // Check for other alternatives if there is no or empty value
  // otherwise initial empty value will not be marked as invalid!
  if (value.length > 0 && !fieldValidator.isEmpty(value)) {
    return validator(value);
  } else if (provider) {
    return null;
  }
  return 'At least one provider or maintainer is required.';
};

/**
 * Validates deployment spec in context of entire operator
 * @param {*} value
 * @param {*} operator
 */
const deploymentSpecContextualValidator = (value, operator) => {
  const serviceAccountName = _.get(value, 'template.spec.serviceAccountName');
  // merge both permissions before search
  const permissions = (_.get(operator, 'spec.install.spec.permissions') || []).concat(
    _.get(operator, 'spec.install.spec.clusterPermissions') || []
  );

  if (!serviceAccountName) {
    return 'Spec.template.spec.serviceAccountName property is required';
  }
  const found = permissions && permissions.some(permission => permission.serviceAccountName === serviceAccountName);

  if (!found && serviceAccountName !== 'default') {
    return 'Spec.template.spec.serviceAccountName property should match defined service account or be set as "default"';
  }

  return null;
};

const nameValidator = name => {
  if (!name) {
    return 'This field is required.';
  }

  const versionStart = name.indexOf('.v');
  if (versionStart < 0) {
    return 'The name must end in a valid semantic version, e.g. v0.0.1';
  }

  const opName = name.slice(0, versionStart);
  if (!nameRegExp.test(opName)) {
    return 'The name portion can only contain lower case characters and dashes.';
  }

  const version = name.slice(versionStart + 1);
  if (!versionRegExp.test(version)) {
    return 'The version portion must contain a valid semantic version string.';
  }

  return null;
};

const descriptionValidator = text => {
  const errorText =
    'Heading level 1 is discouraged in the description as it collides with the rest of the page. Please use heading level 2 or higher.';

  return /(^# [^\r?\n]+)/m.test(text) ? errorText : null;
};

const operatorFieldValidators = {
  metadata: {
    name: {
      required: true,
      regex: nameRegExp,
      regexErrorMessage: nameRegExpMessage,
      props: {
        maxLength: 253
      }
    },
    annotations: {
      capabilities: {
        required: true
      },
      description: {
        required: true,
        props: {
          maxLength: 163
        }
      }
    }
  },
  spec: {
    displayName: {
      required: true
    },
    description: {
      aboutApplication: {
        required: true,
        validator: descriptionValidator
      },
      aboutOperator: {
        required: true,
        validator: descriptionValidator
      },
      prerequisites: {
        validator: descriptionValidator
      }
    },
    version: {
      required: true,
      regex: versionRegExp,
      regexErrorMessage: 'Must be in semantic version format (e.g 0.0.1 or v0.0.1)'
    },
    replaces: {
      validator: nameValidator,
      props: {
        maxLength: 253
      }
    },
    minKubeVersion: {
      regex: majorMinorPatchVersionRegExp,
      regexErrorMessage: "Must be in the format: 'Major.Minor.Patch'. (e.g 0.0.1)"
    },
    maturity: {
      required: true
    },
    provider: {
      name: {
        contextualValidator: providerContextualValidator
      }
    },
    maintainers: {
      validator: maintainersValidator,
      contextualValidator: maintainersContextualValidator,
      isEmpty: maintaners =>
        !maintaners || maintaners.length === 0 || maintaners.every(maintaner => !maintaner.name && !maintaner.email)
    },
    icon: {
      required: true
    },
    labels: {
      isObjectProps: true,
      key: {
        required: true,
        regex: labelRegExp,
        regexErrorMessage: labelRegExpMessage,
        props: {
          maxLength: 63
        }
      },
      value: {
        regex: labelRegExp,
        regexErrorMessage: labelRegExpMessage,
        props: {
          maxLength: 63
        }
      }
    },
    selector: {
      matchLabels: {
        isObjectProps: true,
        key: {
          required: true,
          regex: labelRegExp,
          regexErrorMessage: labelRegExpMessage,
          props: {
            maxLength: 63
          }
        },
        value: {
          regex: labelRegExp,
          regexErrorMessage: labelRegExpMessage,
          props: {
            maxLength: 63
          }
        }
      }
    },
    installModes: {
      required: true
    },
    customresourcedefinitions: {
      owned: {
        isArray: true,
        itemValidator: {
          name: {
            required: true
          },
          version: {
            required: true,
            regex: kubeVersionRegExp,
            regexErrorMessage: kubeVersionRegExpMessage
          },
          kind: {
            required: true,
            regex: labelRegExp,
            regexErrorMessage: labelRegExpMessage
          },
          displayName: {
            required: true
          },
          description: {
            required: true
          },
          resources: {
            isArray: true,
            itemValidator: {
              version: {
                required: true,
                regex: kubeVersionRegExp,
                regexErrorMessage: kubeVersionRegExpMessage
              },
              kind: {
                required: true
              }
            }
          },
          specDescriptors: {
            isArray: true,
            itemValidator: {
              displayName: {
                required: true
              },
              description: {
                required: true
              },
              path: {
                required: true,
                regex: labelRegExp,
                regexErrorMessage: labelRegExpMessage
              },
              'x-descriptors': {
                required: true
              }
            }
          },
          statusDescriptors: {
            isArray: true,
            itemValidator: {
              displayName: {
                required: true
              },
              description: {
                required: true
              },
              path: {
                required: true,
                regex: labelRegExp,
                regexErrorMessage: labelRegExpMessage
              },
              'x-descriptors': {
                required: true
              }
            }
          }
        }
      },
      required: {
        isArray: true,
        itemValidator: {
          name: {
            required: true
          },
          version: {
            required: true,
            regex: kubeVersionRegExp,
            regexErrorMessage: kubeVersionRegExpMessage
          },
          kind: {
            required: true,
            regex: labelRegExp,
            regexErrorMessage: labelRegExpMessage
          },
          displayName: {
            required: true
          },
          description: {
            required: true
          }
        }
      }
    },
    install: {
      spec: {
        deployments: {
          isArray: true,
          required: true,
          requiredError: 'At least one deployment is required.',
          itemValidator: {
            name: {
              required: true
            },
            apiVersion: {
              // contextual validatior is used to catch case when property is present but empty
              // validator can't catch this case :/
              contextualValidator: value =>
                typeof value !== 'undefined' ? 'API version property is invalid in operator deployment' : null
            },
            kind: {
              contextualValidator: value =>
                typeof value !== 'undefined' ? 'Kind property is invalid in operator deployment' : null
            },
            spec: {
              contextualValidator: deploymentSpecContextualValidator
            }
          }
        }
      }
    },
    links: {
      validator: linksValidator
    }
  }
};

const operatorPackageFieldValidators = {
  name: {
    required: true
  },
  channel: {
    required: true
  }
};

export {
  versionRegExp,
  emailRegExp,
  urlRegExp,
  operatorFieldDescriptions,
  operatorObjectDescriptions,
  capabilityDescriptions,
  maturityOptions,
  categoryOptions,
  kindOptions,
  installModeDescriptors,
  operatorFieldPlaceholders,
  operatorFieldValidators,
  operatorPackageFieldValidators
};
