"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundle = bundle;
function bundle(name, language, index) {
    return index.reduce((o, i) => {
        o.rules[i.info.name] = i.rule;
        return o;
    }, {
        name,
        language,
        rules: {},
        index,
    });
}
//# sourceMappingURL=structure.js.map