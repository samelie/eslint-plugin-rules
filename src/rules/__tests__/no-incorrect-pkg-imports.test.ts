import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";
import type { MessageIds, Options } from "../no-incorrect-pkg-imports";
import * as tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";
import rule, { RULE_NAME } from "../no-incorrect-pkg-imports";

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
        // Correct workspace import
        "import { logger } from \"@adddog/logging\";",
        // Correct workspace import with subpath
        "import { env } from \"@adddog/env\";",
        // Relative import within same package (no ../packages or ../src)
        "import { helper } from \"./utils\";",
        // Relative import one level up within same package
        "import { helper } from \"../utils\";",
        // External package import
        "import React from \"react\";",
        // Scoped external package
        "import { z } from \"zod\";",
    ],
    invalid: [
        {
            code: "import { logger } from \"../../../packages/logging/src\";",
            output: "import { logger } from \"@adddog/logging\";",
            errors: [
                { messageId: "relativePackageImport" },
                { messageId: "packageImportWithSrc" },
            ],
        },
        {
            code: "import { env } from \"../../packages/env\";",
            output: "import { env } from \"@adddog/env\";",
            errors: [{ messageId: "relativePackageImport" }],
        },
        {
            code: "import { helper } from \"../../logging/src/index\";",
            output: "import { helper } from \"@adddog/logging\";",
            errors: [{ messageId: "packageImportWithSrc" }],
        },
        {
            code: "import { config } from \"../../../config/src\";",
            output: "import { config } from \"@adddog/config\";",
            errors: [{ messageId: "packageImportWithSrc" }],
        },
    ],
});
