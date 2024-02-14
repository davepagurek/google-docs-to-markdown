import fixGoogleHtml from './fix-google-html.js';
// rehype-dom-parse is a lightweight version of rehype-parse that leverages
// browser APIs -- reduces bundle size by ~200 kB!
import parse from 'rehype-dom-parse';
import { defaultHandlers } from 'hast-util-to-mdast';
import rehype2remarkWithSpaces from './rehype-to-remark-with-spaces.js';
import remarkGfm from 'remark-gfm';
import stringify from 'remark-stringify';
import { unified } from 'unified';

/** @typedef {import("mdast-util-to-markdown").State} MdastState */
/** @typedef {import("unist").Node} UnistNode */
/** @typedef {import("hast-util-to-mdast").Handle} Handle */

/** @type {Handle} */
function preserveTagAndConvertContents (state, node, _parent) {
  return [
    { type: 'html', value: `<${node.tagName}>` },
    ...state.all(node),
    { type: 'html', value: `</${node.tagName}>` },
  ];
}

function unwrapBold(node) {
  if (node.children.length === 1 && ['strong', 'title'].includes(node.children[0].tagName)) {
    // Recursive unwrap in case there's another one hidden in there
    return unwrapBold({ ...node, children: node.children[0].children });
  } else {
    return node;
  }
}

function removeEmpty(state, node, _parent) {
  if (node.children.length === 0) return null
  return defaultHandlers[node.tagName](state, node)
}

/** @type {Handle} */
function headingWithId (state, node, _parent) {
  const num = parseInt(node.tagName.slice(1))
  const nextNum = num + 1
  const nextHeading = 'h' + nextNum
  const newNode = defaultHandlers[nextHeading](state, { ...unwrapBold(node), tagName: nextHeading })

  if (false && node.properties?.id) {
    newNode.children?.push({
      type: 'html',
      value: `<a id="${node.properties.id}"></a>`
    });
  }

  return newNode;
}

function titleToH1 (state, node, _parent) {
  return defaultHandlers.h1(state, { ...node, tagName: 'h1' })
}

/**
 * Use two blank lines before headings. This is a "join" function, which tells
 * remark-stringify how to join adjacent nodes.
 * @param {UnistNode} previous
 * @param {UnistNode} next
 * @param {UnistNode} _parent
 * @param {MdastState} _state
 * @returns {boolean|number|void}
 */
function doubleBlankLinesBeforeHeadings (previous, next, parent, _state) {
  if (previous.type !== 'heading' && next.type === 'heading') {
    return 2;
  }
  if (previous.type === 'list' && next.type === 'list' && previous.ordered === next.ordered) {
    return 0;
  }
  if (previous.type === 'listItem' && next.type === 'listItem') {
    return 0;
  }
  if (
    next.type === 'list' &&
    previous.type === 'paragraph' &&
    parent.type === 'listItem'
  ) {
    console.log(previous, next)
    return 0;
  }
  return undefined;
}

const processor = unified()
  .use(parse)
  .use(fixGoogleHtml)
  // .use(require('./lib/log-tree').default)
  .use(rehype2remarkWithSpaces, {
    handlers: {
      // Preserve sup/sub markup; most Markdowns have no markup for it.
      sub: preserveTagAndConvertContents,
      sup: preserveTagAndConvertContents,
      table: preserveTagAndConvertContents,
      tr: preserveTagAndConvertContents,
      td: preserveTagAndConvertContents,
      th: preserveTagAndConvertContents,
      title: titleToH1,
      h1: headingWithId,
      h2: headingWithId,
      h3: headingWithId,
      h4: headingWithId,
      h5: headingWithId,
      h6: headingWithId,
      strong: removeEmpty,
      em: removeEmpty,
    }
  })
  .use(remarkGfm)
  .use(stringify, {
    bullet: '-',
    emphasis: '*',
    fences: true,
    listItemIndent: 'one',
    strong: '*',
    join: [doubleBlankLinesBeforeHeadings],
    tightDefinitions: true,
    rule: '-',
  });

/**
 * Parse a Google Docs Slice Clip (the Google Docs internal format for
 * representing copied documents or selections from a document). This parses a
 * string representing the document and unwraps it if enclosed in a wrapper
 * object. You can pass in a string or object.
 * @param {any} raw
 * @returns {any}
 */
function parseGdocsSliceClip(raw) {
  const wrapper = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const data = typeof wrapper.data === 'string' ? JSON.parse(wrapper.data) : wrapper.data;

  // Do a basic check to ensure we are dealing with what we think we are. This
  // is not meant to be exhaustive or to check the exact schema.
  if (
    typeof data?.resolved?.dsl_entitypositionmap !== 'object'
    || typeof data?.resolved?.dsl_spacers !== 'string'
    || !Array.isArray(data?.resolved?.dsl_styleslices)
  ) {
    throw new SyntaxError(`Document does not appear to be a GDocs Slice Clip: ${JSON.stringify(raw)}`);
  }

  return data;
}

function fixOffsetLinks(md) {
  return md.replace(/\[ ([^\]]+)\]/g, ' [$1]')
}

function fixNoTitle(md) {
  if (/^# \w+/m.exec(md)) {
    return md
  } else {
    return md.replace(/^#(#+) /mg, '$1 ')
  }
}

export function convertDocsHtmlToMarkdown(html, rawSliceClip) {
  const sliceClip = rawSliceClip ? parseGdocsSliceClip(rawSliceClip) : null;
  return processor.process({
    value: html,
    data: {
      sliceClip
    }
  }).then(result => result.value).then(fixOffsetLinks).then(fixNoTitle);
}
