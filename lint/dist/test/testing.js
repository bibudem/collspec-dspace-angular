"use strict";
/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlRuleTester = exports.tsRuleTester = void 0;
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const theme_support_1 = require("../src/util/theme-support");
const fixture_1 = require("./fixture");
// Register themed components from test fixture
theme_support_1.themeableComponents.initialize(fixture_1.FIXTURE);
rule_tester_1.RuleTester.itOnly = fit;
rule_tester_1.RuleTester.itSkip = xit;
exports.tsRuleTester = new rule_tester_1.RuleTester({
    defaultFilenames: {
        ts: (0, fixture_1.fixture)('src/test.ts'),
        tsx: 'n/a',
    },
    languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        parser: require('@typescript-eslint/parser'),
        parserOptions: {
            project: (0, fixture_1.fixture)('tsconfig.json'),
        },
    },
});
class HtmlRuleTester extends rule_tester_1.RuleTester {
    run(name, rule, tests) {
        super.run(name, rule, {
            valid: tests.valid.map((test) => ({
                filename: (0, fixture_1.fixture)('test.html'),
                ...test,
            })),
            invalid: tests.invalid.map((test) => ({
                filename: (0, fixture_1.fixture)('test.html'),
                ...test,
            })),
        });
    }
}
exports.htmlRuleTester = new HtmlRuleTester({
    languageOptions: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        parser: require('@angular-eslint/template-parser'),
    },
});
//# sourceMappingURL=testing.js.map