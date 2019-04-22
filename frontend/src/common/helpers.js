import * as _ from 'lodash-es';
import { Converter } from 'showdown';
import * as sanitizeHtml from 'sanitize-html';

const noop = Function.prototype;

/** Implementation of the debounce function */
export const debounce = (func, wait) => {
  let timeout;
  function innerFunc(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  }
  return innerFunc;
};

const getErrorMessageFromResults = results => {
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

const FULFILLED_ACTION = base => `${base}_FULFILLED`;
const PENDING_ACTION = base => `${base}_PENDING`;
const REJECTED_ACTION = base => `${base}_REJECTED`;

let _advancedUploadAvailable;
const advancedUploadAvailable = () => {
  if (_advancedUploadAvailable === undefined) {
    const div = document.createElement('div');
    _advancedUploadAvailable =
      'draggable' in div || ('ondragstart' in div && 'ondrop' in div && 'FormData' in window && 'FileReader' in window);
  }
  return advancedUploadAvailable;
};

const markdownConverter = {
  makeHtml: markdown => {
    const unsafeHtml = new Converter({
      tables: true,
      openLinksInNewWindow: true,
      strikethrough: true,
      emoji: true
    }).makeHtml(markdown);

    return sanitizeHtml(unsafeHtml, {
      allowedTags: [
        'b',
        'i',
        'strike',
        's',
        'del',
        'em',
        'strong',
        'a',
        'p',
        'h1',
        'h2',
        'h3',
        'h4',
        'ul',
        'ol',
        'li',
        'code',
        'pre',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td'
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel']
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      transformTags: {
        a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true)
      }
    });
  }
};

const transformNameForPath = name => name.replace(/\./g, '_=_');

const transformPathedName = name => name.replace(/_=_/g, '.');

export const helpers = {
  noop,
  debounce,
  markdownConverter,
  transformNameForPath,
  transformPathedName,
  getErrorMessageFromResults,
  advancedUploadAvailable,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION
};

export default helpers;
