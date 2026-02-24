import type { TSESTree } from "@typescript-eslint/utils";
import { createEslintRule } from "../utils.ts";

export const RULE_NAME = "enforce-design-system-rad-imports";
export type MessageIds = "barrelImport" | "uiDeepImport";
export type Options = [];

const PKG = "@adddog/shadcn-vue-design-system";

/**
 * Component family prefixes mapped to their directory names.
 * Ordered longest-prefix-first so "DropdownMenu" matches before "Dropdown" etc.
 */
const FAMILY_MAP: [prefix: string, dir: string][] = [
    ["DropdownMenu", "dropdown-menu"],
    ["RangeCalendar", "range-calendar"],
    ["TagsInput", "tags-input"],
    ["ToggleGroup", "toggle-group"],
    ["Accordion", "accordion"],
    ["Button", "button"],
    ["Calendar", "calendar"],
    ["Checkbox", "checkbox"],
    ["Command", "command"],
    ["Dialog", "dialog"],
    ["Drawer", "drawer"],
    ["Input", "input"],
    ["Label", "label"],
    ["Popover", "popover"],
    ["Switch", "switch"],
    ["Table", "table"],
    ["Toggle", "toggle"],
    ["Tooltip", "tooltip"],
];

function resolveFamily(name: string): string | undefined {
    for (const [prefix, dir] of FAMILY_MAP) {
        if (name.startsWith(prefix)) return dir;
    }
    return undefined;
}

function buildRadImport(name: string, dir: string): string {
    return `${PKG}/components/rad/${dir}/${name}.vue`;
}

export default createEslintRule<Options, MessageIds>({
    name: RULE_NAME,
    meta: {
        type: "problem",
        docs: {
            description: "Enforce deep rad/ imports from @adddog/shadcn-vue-design-system instead of barrel or ui/ imports",
        },
        fixable: "code",
        schema: [],
        messages: {
            barrelImport: "Import from @adddog/shadcn-vue-design-system barrel — use deep rad/ imports instead",
            uiDeepImport: "Import from components/ui/ — use components/rad/ instead",
        },
    },
    defaultOptions: [],

    create(context) {
        return {
            ImportDeclaration(node) {
                const source = node.source.value;
                if (typeof source !== "string") return;

                // --- ui/ deep import ---
                if (source.startsWith(PKG) && source.includes("/components/ui/")) {
                    context.report({
                        node,
                        messageId: "uiDeepImport",
                        fix: fixer => fixer.replaceText(
                            node.source,
                            `"${source.replace("/components/ui/", "/components/rad/")}"`,
                        ),
                    });
                    return;
                }

                // --- barrel import ---
                if (source !== PKG) return;

                // namespace import — can't split, report only
                if (node.specifiers.some(s => s.type === "ImportNamespaceSpecifier")) {
                    context.report({ node, messageId: "barrelImport" });
                    return;
                }

                const named = node.specifiers.filter(
                    (s): s is TSESTree.ImportSpecifier => s.type === "ImportSpecifier",
                );
                if (named.length === 0) return;

                const isTypeImport = node.importKind === "type";
                const fixable = named.every(s => resolveFamily(s.imported.type === "Identifier" ? s.imported.name : s.imported.value) !== undefined);

                if (!fixable) {
                    context.report({ node, messageId: "barrelImport" });
                    return;
                }

                context.report({
                    node,
                    messageId: "barrelImport",
                    fix: fixer => {
                        const lines = named.map(s => {
                            const importedName = s.imported.type === "Identifier" ? s.imported.name : s.imported.value;
                            const dir = resolveFamily(importedName)!;
                            const path = buildRadImport(importedName, dir);
                            const typePrefix = isTypeImport ? "type " : "";

                            // aliased: import { default as Alias } from "..."
                            if (s.local.name !== importedName) {
                                return `import ${typePrefix}{ default as ${s.local.name} } from "${path}";`;
                            }
                            return `import ${typePrefix}${importedName} from "${path}";`;
                        });
                        return fixer.replaceText(node, lines.join("\n"));
                    },
                });
            },
        };
    },
});
