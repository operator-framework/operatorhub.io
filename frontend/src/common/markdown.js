import sanitizeHtml from 'sanitize-html';
import { Converter } from 'showdown';

export const markdownConverter = {
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
