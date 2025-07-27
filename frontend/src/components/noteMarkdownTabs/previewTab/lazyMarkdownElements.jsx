import {autoDir} from "@/utils/langUtils";
import {lazyWrapper} from './lazyWrapper';

export const lazyMarkdownElements = {
    h1: autoDir(lazyWrapper('h1')),
    h2: autoDir(lazyWrapper('h2')),
    h3: autoDir(lazyWrapper('h3')),
    h4: autoDir(lazyWrapper('h4')),
    h5: autoDir(lazyWrapper('h5')),
    h6: autoDir(lazyWrapper('h6')),
    p: autoDir(lazyWrapper('p')),
    ul: autoDir(lazyWrapper('ul')),
    ol: autoDir(lazyWrapper('ol')),
    li: autoDir(lazyWrapper('li')),
    pre: autoDir(lazyWrapper('pre')),
    blockquote: autoDir(lazyWrapper('blockquote')),
    table: autoDir(lazyWrapper('table')),
    thead: autoDir(lazyWrapper('thead')),
    tbody: autoDir(lazyWrapper('tbody')),
    tr: autoDir(lazyWrapper('tr')),
    th: autoDir(lazyWrapper('th')),
    td: autoDir(lazyWrapper('td')),
    dl: autoDir(lazyWrapper('dl')),
    dt: autoDir(lazyWrapper('dt')),
    dd: autoDir(lazyWrapper('dd')),

    span: lazyWrapper('span'),
    strong: lazyWrapper('strong'),
    em: lazyWrapper('em'),
    del: lazyWrapper('del'),
};
