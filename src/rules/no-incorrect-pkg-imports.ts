import { createEslintRule } from "../utils";

export const RULE_NAME = "no-incorrect-pkg-imports";
export type MessageIds = "relativePackageImport" | "packageImportWithSrc";
export type Options = [];

/**
 * Regex pattern to match relative imports that traverse up to the packages directory.
 *
 * Pattern breakdown:
 * - `^((\.\.\/)+(.*?)(\/packages))?` - Optional: one or more '../' followed by path segments and '/packages'
 * - `(\/.+)?$` - Optional: remaining path after packages
 *
 * Examples of matches:
 * - '../../../packages/logging/src/index.ts'
 * - '../../packages/env'
 *
 * Capture groups:
 * - [0]: Full match
 * - [1]: Everything up to and including '/packages'
 * - [2]: Last '../'
 * - [3]: Package name (e.g., 'logging', 'env')
 * - [4]: Literal '/packages'
 * - [5]: Remaining path after package name
 */
const RELATIVE_PACKAGES_IMPORT_PATTERN = /^((\.\.\/)+(.*?)(\/packages))?(\/.+)?$/;

/**
 * Regex pattern to match relative imports that include '/src' in the path.
 *
 * Pattern breakdown:
 * - `^((\.\.\/)+(.*?)(\/src))?` - Optional: one or more '../' followed by path segments and '/src'
 * - `(\/.+)?$` - Optional: remaining path after src
 *
 * Examples of matches:
 * - '../../../logging/src/index.ts'
 * - '../../env/src'
 *
 * Capture groups:
 * - [0]: Full match
 * - [1]: Everything up to and including '/src'
 * - [2]: Last '../'
 * - [3]: Package name (e.g., 'logging', 'env')
 * - [4]: Literal '/src'
 * - [5]: Remaining path after src
 */
const RELATIVE_SRC_IMPORT_PATTERN = /^((\.\.\/)+(.*?)(\/src))?(\/.+)?$/;

/**
 * The workspace scope used for all internal packages.
 * In this monorepo, all packages are scoped under '@adddog/'.
 */
const WORKSPACE_SCOPE = "@adddog";

/**
 * ESLint rule to prevent incorrect package imports in a monorepo.
 *
 * This rule enforces that packages within the monorepo are imported using
 * the workspace scope (@adddog) rather than relative paths. It automatically
 * fixes violations by converting relative imports to scoped imports.
 *
 * ❌ Bad:
 * ```ts
 * import { logger } from '../../../packages/logging/src'
 * import { env } from '../../env/src/config'
 * ```
 *
 * ✅ Good:
 * ```ts
 * import { logger } from '@adddog/logging'
 * import { env } from '@adddog/env'
 * ```
 *
 * @see https://pnpm.io/workspaces for more on pnpm workspace patterns
 */
export default createEslintRule<Options, MessageIds>({
    name: RULE_NAME,
    meta: {
        type: "problem",
        docs: {
            description: "Prevents incorrectly importing from packages via relative imports or with '/src' appended",
        },
        fixable: "code",
        schema: [],
        messages: {
            relativePackageImport: "Use workspace imports (@adddog/package-name) instead of relative paths through the packages directory",
            packageImportWithSrc: "Use workspace imports (@adddog/package-name) instead of relative paths with '/src' in them",
        },
    },
    defaultOptions: [],

    create(context) {
        return {
            /**
             * Checks import declarations for incorrect relative package imports.
             */
            ImportDeclaration(node) {
                const importSource = node.source.value;

                // Ensure we're working with a string import source
                if (typeof importSource !== "string") {
                    return;
                }

                // Check for imports that traverse through the packages directory
                const packagesImportMatch = importSource.match(RELATIVE_PACKAGES_IMPORT_PATTERN);
                if (packagesImportMatch) {
                    // Extract the package name from the matched groups
                    // Find the first capture group that doesn't contain '..' or 'packages'
                    const packageName = packagesImportMatch.find(
                        group => group && !group.includes("..") && !group.includes("packages"),
                    ) || "";

                    // Remove '/src' if present, as workspace imports don't include it
                    const cleanPackageName = packageName.replace("/src", "");

                    context.report({
                        messageId: "relativePackageImport",
                        node: node.specifiers[0] || node,
                        fix: fixer => {
                            const workspaceImport = `"${WORKSPACE_SCOPE}${cleanPackageName}"`;
                            return fixer.replaceText(node.source, workspaceImport);
                        },
                    });
                }

                // Check for imports that include '/src' in relative paths
                const srcImportMatch = importSource.match(RELATIVE_SRC_IMPORT_PATTERN);
                if (srcImportMatch) {
                    // Extract the package name (capture group 3)
                    const packageName = srcImportMatch[3];

                    if (packageName) {
                        context.report({
                            node: node.specifiers[0] || node,
                            messageId: "packageImportWithSrc",
                            fix: fixer => {
                                const workspaceImport = `"${WORKSPACE_SCOPE}/${packageName}"`;
                                return fixer.replaceText(node.source, workspaceImport);
                            },
                        });
                    }
                }
            },
        };
    },
});
