import _ from 'lodash-es';

export const noop = Function.prototype as () => void;

/** Implementation of the debounce function */
export const debounce = (func: Function, wait: number) => {
  let timeout;
  function innerFunc(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  }
  return innerFunc;
};

export const getErrorMessageFromResults = results => {
  const responseData = _.get(results, 'response.data', results.message);

  if (typeof responseData === 'string') {
    return responseData;
  }

  const getMessages = messageObject =>
    _.map(messageObject, next => {
      if (_.isString(next)) {
        return next;
      }
      if (_.isArray(next)) {
        return getMessages(next);
      }
      return 'Unknown error';
    });

  return _.join(getMessages(responseData), '\n');
};

export const FULFILLED_ACTION = base => `${base}_FULFILLED`;
export const PENDING_ACTION = base => `${base}_PENDING`;
export const REJECTED_ACTION = base => `${base}_REJECTED`;

let _advancedUploadAvailable: boolean | undefined = undefined;

export const advancedUploadAvailable = () => {

  if (_advancedUploadAvailable === undefined) {
    const div = document.createElement('div');
    _advancedUploadAvailable =
      'draggable' in div || ('ondragstart' in div && 'ondrop' in div && 'FormData' in window && 'FileReader' in window);
  }
  return _advancedUploadAvailable;
};

export const supportFileSystemEntry = () => {
  return typeof DataTransferItem.prototype.webkitGetAsEntry === 'function';
}

export const transformNameForPath = (name: string) => name.replace(/\./g, '_=_');

export const transformPathedName = (name: string) => name.replace(/_=_/g, '.');
