import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";
import type { MessageIds, Options } from "../no-as-unknown-as";
import * as tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";
import rule, { RULE_NAME } from "../no-as-unknown-as";

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
        // Single type assertion is allowed
        "const x = value as string;",
        // as const is allowed
        "const x = [1, 2, 3] as const;",
        // as unknown (without second assertion) is allowed
        "const x = value as unknown;",
        // Regular variable declaration
        "const x: string = 'hello';",
        // Type assertion with `as` but not double
        "const x = value as SomeType;",
        // Satisfies keyword (not an assertion)
        "const x = value satisfies SomeType;",
    ],
    invalid: [
        {
            code: "const x = value as unknown as string;",
            errors: [{ messageId: "noDoubleAssertion" }],
        },
        {
            code: "const x = someObj as unknown as SomeInterface;",
            errors: [{ messageId: "noDoubleAssertion" }],
        },
        {
            code: "const fn = callback as unknown as () => void;",
            errors: [{ messageId: "noDoubleAssertion" }],
        },
        {
            code: "return data as unknown as Record<string, unknown>;",
            errors: [{ messageId: "noDoubleAssertion" }],
        },
        {
            code: "const arr = items as unknown as number[];",
            errors: [{ messageId: "noDoubleAssertion" }],
        },
    ],
});
