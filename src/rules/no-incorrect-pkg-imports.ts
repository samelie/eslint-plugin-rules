import { createEslintRule } from "../utils";

export const RULE_NAME = "no-incorrect-pkg-imports";
export type MessageIds = "noIncorrectPkgImports" | "pkgToPkg";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
    name: RULE_NAME,
    meta: {
        type: "problem",
        docs: {
            description: "Prevents incorrectly importing from pkgs via relative imports or with '/src' appended",
        },
        fixable: "code",
        schema: [],
        messages: {
            noIncorrectPkgImports: "Expect no duplication in imports",
            pkgToPkg: "Don't include ../../packages in imports path",
        },
    },
    defaultOptions: [],

    create(context) {
        return {
            ImportDeclaration(node) {
                // const names = new Set<string>()
                // node.specifiers.forEach((n) => {
                //   const id = n.local.name
                //   if (names.has(id)) {
                //     context.report({
                //       node,
                //       loc: {
                //         start: n.loc.end,
                //         end: n.loc.start,
                //       },
                //       messageId: 'noIncorrectPkgImports',
                //       fix(fixer) {
                //         const s = n.range[0]
                //         let e = n.range[1]
                //         if (context.getSourceCode().text[e] === ',')
                //           e += 1
                //         return fixer.removeRange([s, e])
                //       },
                //     })
                //   }
                //   names.add(id)
                // })

                // https://regex101.com/r/yLBtWV/1
                // ../../../../utils/src
                const pkgToPkgRoot = node.source.value.match(/^((\.\.\/)+(.*?)(\/packages))?(\/.+)?$/);
                if (pkgToPkgRoot) {
                    context.report({
                        messageId: "noIncorrectPkgImports",
                        node: node.specifiers[0],
                        fix: fixer => {
                            // eg: "../../../../../packages/type-gen-output/fake-type-gen"; --> "@rad/type-gen-output/fake-type-gen";
                            let special = pkgToPkgRoot.find(m => !["..", "packages"].some(n => m.includes(n))) || "";
                            special = special.replace("/src", "");
                            return fixer.replaceText(node.source, `"@rad${special}"`);
                        },
                    });
                }
                const pkgToPkg = node.source.value.match(/^((\.\.\/)+(.*?)(\/src))?(\/.+)?$/);
                if (pkgToPkg) {
                    context.report({
                        node: node.specifiers[0],
                        messageId: "pkgToPkg",
                        fix: fixer => {
                            // eg: "import { ValuesType } from "../../../../../../type-utils/src";";
                            const special = pkgToPkg[3];
                            return fixer.replaceText(node.source, `"@rad/${special}"`);
                        },
                    });
                }
            },
        };
    },
});
