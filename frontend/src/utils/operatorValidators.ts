/* eslint-disable no-template-curly-in-string */
import _ from 'lodash-es';
import { OperatorLink, Operator, OperatorMaintainer, OperatorProvider } from './operatorTypes';

const nameRegExp = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const nameRegExpMessage =
  'This field must begin and end with a lower case character with only dashes or lower case characters between.';

export const versionRegExp = /^([v|V])?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/;

export const versionNoLeadingVRegExp = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/;

const kubeVersionRegExp = /^([v|V])(0|[1-9])+(alpha|beta)?(0|[1-9])*/;
const kubeVersionRegExpMessage =
  'Must start with a v, followed by a version number, and optionally a alpha or beta version';

const kubeGroupVersionRegExp = /^([a-z.]+\/)?([v|V])(0|[1-9])+(alpha|beta)?([0-9])*/;
const kubeGroupVersionRegExpMessage =
  'Must start with either API group or a v, followed by a version number, and optionally a alpha or beta version';

const majorMinorPatchVersionRegExp = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/;

export const urlRegExp = new RegExp(
  '^(?:(?:(?:https?|ftp):)?//)' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port
  '(\\?[;&amp;a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$',
  'i'
);

export const emailRegExp = new RegExp(
  "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
);

// allow array index e.g. [0]  in path and starts and end with word
const pathRegExp = /^([a-z0-9A-Z][a-z0-9A-Z-_]*)((\[[0-9]+\])|\.[a-z0-9A-Z-_]+)*$/;
const pathRegExpMessage =
  'Path must begin and end with an alphanumeric character with brackets, dashes, underscores, dots, and alphanumerics between.';

const labelRegExp = /^[a-z0-9A-Z][a-z0-9A-Z-_./]*[a-z0-9A-Z]$/;
const labelRegExpMessage =
  'This field must begin and end with an alphanumeric character with dashes, underscores, dots, and alphanumerics between.';

export type KeyValueItemError = {
  key: string,
  value: string,
  keyError: string | null,
  valueError: string | null
};

const linksValidator = (links: OperatorLink[]) => {
  if (!links || _.isEmpty(links) || (links.length === 1 && !links[0].name && !links[0].url)) {
    return 'At least one external link is required.';
  }

  const linksErrors: KeyValueItemError[] = [];

  links.forEach(link => {
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

  if (linksErrors.length > 0) {
    return linksErrors;
  }

  return null;
};


const providerContextualValidator = (value: string, operator: Operator) => {
  const maintainers: OperatorMaintainer[] = _.get(operator, 'spec.maintainers');
  const maintainersValidatorObject = operatorFieldValidators.spec.maintainers;

  if (!maintainersValidatorObject.isEmpty(maintainers) || value) {
    return null;
  }

  return 'At least one provider or maintainer is required.';
};

const maintainersValidator = (maintainers: OperatorMaintainer[]) => {
  if (!maintainers || _.isEmpty(maintainers)) {
    return 'At least one maintainer is required.';
  }

  const maintainerErrors: KeyValueItemError[] = [];
  maintainers.forEach(maintainer => {
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
 * Validates fields in context of other fields to catch field cross dependancies
 */
const maintainersContextualValidator = (value: OperatorMaintainer[], operator: Operator, fieldValidator) => {
  const provider: OperatorProvider = _.get(operator, 'spec.provider.name');
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
 */
const deploymentSpecContextualValidator = (value: any, operator: Operator) => {
  const serviceAccountName: string = _.get(value, 'template.spec.serviceAccountName');
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

const nameValidator = (name: string) => {
  if (!name) {
    return 'This field is required.';
  }

  let versionStart = name.indexOf('.v');

    // recover from case that no "".v" is present just version number!
    const match = name.match(/\.[0-9]+\.[0-9]+\.[0-9]+/);

    if(match && typeof match.index === 'number'){
      versionStart = match.index;
    }
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

const descriptionValidator = (text: string) => {
  const errorText =
    'Heading level 1 is discouraged in the description as it collides with the rest of the page. Please use heading level 2 or higher.';

  return /(^# [^\r?\n]+)/m.test(text) ? errorText : null;
};

export const operatorFieldValidators = {
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
      regexErrorMessage: 'Must be in semantic version format (e.g 0.0.1 or v0.0.1)',
      props: {
        disabled: 'disabled'
      }
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
                regex: kubeGroupVersionRegExp,
                regexErrorMessage: kubeGroupVersionRegExpMessage
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
                regex: pathRegExp,
                regexErrorMessage: pathRegExpMessage
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
                regex: pathRegExp,
                regexErrorMessage: pathRegExpMessage
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
        },
        permissions: {
          isArray: true,
          itemValidator: {
            serviceAccountName: {
              required: true
            }
          }
        },
        clusterPermissions: {
          isArray: true,
          itemValidator: {
            serviceAccountName: {
              required: true
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

export const operatorPackageFieldValidators = {
  name: {
    required: true,
    regex: nameRegExp,
    regexErrorMessage: nameRegExpMessage
  },
  channel: {
    required: true,
    regex: nameRegExp,
    regexErrorMessage: nameRegExpMessage
  }
};

export const simpleNameValidator = {
  required: true,
  regex: nameRegExp,
  regexErrorMessage: nameRegExpMessage
};

export const pureVersionValidator = {
  required: true,
  regex: versionNoLeadingVRegExp,
  regexErrorMessage: 'The version portion must contain a valid semantic version string.'
}
