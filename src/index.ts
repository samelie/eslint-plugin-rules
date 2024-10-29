import type { ESLint, Linter } from "eslint";
import noIncorrectPkgImports from "./rules/no-incorrect-pkg-imports";

const plugin = {
    meta: {
        name: "rad",
    },
    // @keep-sorted
    rules: {
        "no-incorrect-pkg-imports": noIncorrectPkgImports,
    },
} satisfies ESLint.Plugin;

export default plugin;

type RuleDefinitions = (typeof plugin)["rules"];

export type RuleOptions = {
    [K in keyof RuleDefinitions]: RuleDefinitions[K]["defaultOptions"];
};

export type Rules = {
    [K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>;
};
