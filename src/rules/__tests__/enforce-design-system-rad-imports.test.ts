import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";
import type { MessageIds, Options } from "../enforce-design-system-rad-imports";
import * as tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";
import rule, { RULE_NAME } from "../enforce-design-system-rad-imports";

RuleTester.afterAll = () => {};
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
    languageOptions: {
        parser: tsParser,
    },
});

// eslint-disable-next-line rad/no-as-unknown-as -- bridging eslint and @typescript-eslint RuleModule types
ruleTester.run(RULE_NAME, rule as unknown as RuleModule<MessageIds, Options>, {
    valid: [
        // Deep rad/ import — correct
        `import Button from "@adddog/shadcn-vue-design-system/components/rad/button/Button.vue";`,
        // Lib utils — not a component import
        `import { cn } from "@adddog/shadcn-vue-design-system/lib/utils";`,
        // Non-standard deep path — not ui/ or barrel
        `import AppDrawer from "@adddog/shadcn-vue-design-system/other/drawer/AppDrawer.vue";`,
        // Unrelated package
        `import { something } from "other-package";`,
        // Deep rad/ type import
        `import type Button from "@adddog/shadcn-vue-design-system/components/rad/button/Button.vue";`,
    ],
    invalid: [
        // Barrel single
        {
            code: `import { Button } from "@adddog/shadcn-vue-design-system";`,
            output: `import Button from "@adddog/shadcn-vue-design-system/components/rad/button/Button.vue";`,
            errors: [{ messageId: "barrelImport" }],
        },
        // Barrel multi
        {
            code: `import { Button, Input } from "@adddog/shadcn-vue-design-system";`,
            output: [
                `import Button from "@adddog/shadcn-vue-design-system/components/rad/button/Button.vue";`,
                `import Input from "@adddog/shadcn-vue-design-system/components/rad/input/Input.vue";`,
            ].join("\n"),
            errors: [{ messageId: "barrelImport" }],
        },
        // Barrel complex — same-family components
        {
            code: `import { DialogContent, DialogTitle } from "@adddog/shadcn-vue-design-system";`,
            output: [
                `import DialogContent from "@adddog/shadcn-vue-design-system/components/rad/dialog/DialogContent.vue";`,
                `import DialogTitle from "@adddog/shadcn-vue-design-system/components/rad/dialog/DialogTitle.vue";`,
            ].join("\n"),
            errors: [{ messageId: "barrelImport" }],
        },
        // ui/ deep import — replace with rad/
        {
            code: `import Button from "@adddog/shadcn-vue-design-system/components/ui/button/Button.vue";`,
            output: `import Button from "@adddog/shadcn-vue-design-system/components/rad/button/Button.vue";`,
            errors: [{ messageId: "uiDeepImport" }],
        },
        // ui/ deep import without .vue
        {
            code: `import Button from "@adddog/shadcn-vue-design-system/components/ui/button";`,
            output: `import Button from "@adddog/shadcn-vue-design-system/components/rad/button";`,
            errors: [{ messageId: "uiDeepImport" }],
        },
        // Aliased barrel import
        {
            code: `import { Button as Btn } from "@adddog/shadcn-vue-design-system";`,
            output: `import { default as Btn } from "@adddog/shadcn-vue-design-system/components/rad/button/Button.vue";`,
            errors: [{ messageId: "barrelImport" }],
        },
        // Type barrel import
        {
            code: `import type { Button } from "@adddog/shadcn-vue-design-system";`,
            output: `import type Button from "@adddog/shadcn-vue-design-system/components/rad/button/Button.vue";`,
            errors: [{ messageId: "barrelImport" }],
        },
        // Unrecognized specifier — no fix
        {
            code: `import { cn } from "@adddog/shadcn-vue-design-system";`,
            errors: [{ messageId: "barrelImport" }],
        },
        // Namespace import — no fix
        {
            code: `import * as DS from "@adddog/shadcn-vue-design-system";`,
            errors: [{ messageId: "barrelImport" }],
        },
        // DropdownMenu multi-word prefix
        {
            code: `import { DropdownMenuContent, DropdownMenuTrigger } from "@adddog/shadcn-vue-design-system";`,
            output: [
                `import DropdownMenuContent from "@adddog/shadcn-vue-design-system/components/rad/dropdown-menu/DropdownMenuContent.vue";`,
                `import DropdownMenuTrigger from "@adddog/shadcn-vue-design-system/components/rad/dropdown-menu/DropdownMenuTrigger.vue";`,
            ].join("\n"),
            errors: [{ messageId: "barrelImport" }],
        },
    ],
});
