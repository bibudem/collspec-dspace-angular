"use strict";
/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.match = match;
exports.stringLiteral = stringLiteral;
exports.toUnixStylePath = toUnixStylePath;
function match(rangeA, rangeB) {
    return rangeA[0] === rangeB[0] && rangeA[1] === rangeB[1];
}
function stringLiteral(value) {
    return `'${value}'`;
}
/**
 * Transform Windows-style paths into Unix-style paths
 */
function toUnixStylePath(path) {
    // note: we're assuming that none of the directory/file names contain '\' or '/' characters.
    //       using these characters in paths is very bad practice in general, so this should be a safe assumption.
    if (path.includes('\\')) {
        return path.replace(/^[A-Z]:\\/, '/').replaceAll('\\', '/');
    }
    return path;
}
//# sourceMappingURL=misc.js.map