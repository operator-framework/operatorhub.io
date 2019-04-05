import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Converter } from 'showdown';
import * as sanitizeHtml from 'sanitize-html';

export const MarkdownView = ({ className, markdown, ...props }) => {
  const converter = {
    makeHtml: markdownToConvert => {
      const unsafeHtml = new Converter({
        tables: true,
        openLinksInNewWindow: true,
        strikethrough: true,
        emoji: true
      }).makeHtml(markdownToConvert);

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

  return (
    <div
      className={classNames('oh-markdown-view', className)}
      {...props}
      dangerouslySetInnerHTML={{ __html: converter.makeHtml(markdown) }}
    />
  );
};

MarkdownView.propTypes = {
  className: PropTypes.string,
  markdown: PropTypes.string
};

MarkdownView.defaultProps = {
  className: '',
  markdown: ''
};
