"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
const structure_1 = require("../../util/structure");
/* eslint-disable import/no-namespace */
const aliasImports = __importStar(require("./alias-imports"));
const noDefaultStandaloneValue = __importStar(require("./no-default-standalone-value"));
const sortStandaloneImports = __importStar(require("./sort-standalone-imports"));
const themedComponentSelectors = __importStar(require("./themed-component-selectors"));
const themedComponentUsages = __importStar(require("./themed-component-usages"));
const themedDecorators = __importStar(require("./themed-decorators"));
const themedWrapperNoInputDefaults = __importStar(require("./themed-wrapper-no-input-defaults"));
const uniqueDecorators = __importStar(require("./unique-decorators"));
const index = [
    aliasImports,
    noDefaultStandaloneValue,
    sortStandaloneImports,
    themedComponentSelectors,
    themedComponentUsages,
    themedDecorators,
    themedWrapperNoInputDefaults,
    uniqueDecorators,
];
module.exports = {
    ...(0, structure_1.bundle)('dspace-angular-ts', 'TypeScript', index),
};
//# sourceMappingURL=index.js.map