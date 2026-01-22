import type { RuleListener, RuleWithMeta, RuleWithMetaAndName } from "@typescript-eslint/utils/eslint-utils";
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import type { Rule } from "eslint";

/**
 * List of rule names that have dedicated documentation markdown files.
 *
 * Rules in this list will link to `.md` files, while others will link
 * to their corresponding `.test.ts` files as documentation.
 */
const rulesWithDedicatedDocs = ["consistent-list-newline", "if-newline", "import-dedupe", "top-level-function"];

/**
 * Base URL for rule documentation in the source repository.
 *
 * Used to generate documentation URLs for each rule based on whether
 * they have dedicated markdown docs or test file documentation.
 */
const ruleDocumentationBaseUrl = "https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/";

/**
 * Extended ESLint rule module that includes default options.
 *
 * This interface extends the base ESLint Rule.RuleModule to include
 * strongly-typed default options for the rule.
 *
 * @template TOptions - Tuple type representing the rule's option values
 */
export interface RuleModule<TOptions extends readonly unknown[]> extends Rule.RuleModule {
    defaultOptions: TOptions;
}

/**
 * Creates a higher-order function for creating ESLint rules with documentation URLs.
 *
 * This factory function generates a rule creator that automatically adds
 * documentation URLs to rules based on a provided URL generation strategy.
 *
 * @param urlCreator - Function that generates a documentation URL from a rule name
 * @returns A function that creates properly configured ESLint rules with docs URLs
 *
 * @remarks
 * The returned function preserves full type safety for rule options and message IDs.
 * When TypeScript PR #26349 lands, this will support even better type checking
 * for the context.report `data` property.
 */
function createRuleFactory(urlCreator: (ruleName: string) => string) {
    /**
     * Creates a named ESLint rule with automatic documentation URL generation.
     *
     * @template TOptions - Tuple type of rule option values
     * @template TMessageIds - Union type of message identifier strings
     *
     * @param config - Rule configuration including name, meta, and create function
     * @param config.name - The name of the rule
     * @param config.meta - Rule metadata including docs, messages, and schema
     * @returns Configured rule module with default options and documentation
     */
    return function createNamedRule<TOptions extends readonly unknown[], TMessageIds extends string>({
        name,
        meta,
        ...restOfRule
    }: Readonly<RuleWithMetaAndName<TOptions, TMessageIds>>): RuleModule<TOptions> {
        return createRule<TOptions, TMessageIds>({
            meta: {
                ...meta,
                docs: {
                    ...meta.docs,
                    url: urlCreator(name),
                },
            },
            ...restOfRule,
        });
    };
}

/**
 * Creates a well-typed TypeScript ESLint rule with default options merging.
 *
 * This is the core rule creation function that handles merging user-provided
 * options with default options. It ensures that rules always have valid
 * configuration even when users provide partial options.
 *
 * @template TOptions - Tuple type of rule option values
 * @template TMessageIds - Union type of message identifier strings
 *
 * @param config - Rule configuration with create function, default options, and metadata
 * @param config.create - Function that creates the rule listener
 * @param config.defaultOptions - Default option values for the rule
 * @param config.meta - Rule metadata including type, docs, and messages
 * @returns Fully configured ESLint rule module
 *
 * @remarks
 * It is generally better to use `createEslintRule` (via createRuleFactory)
 * which automatically adds documentation URLs to rules.
 *
 * @example
 * ```ts
 * const myRule = createRule({
 *   create(context, options) {
 *     return {
 *       // ... rule implementation
 *     }
 *   },
 *   defaultOptions: [{ enabled: true }],
 *   meta: {
 *     type: 'problem',
 *     // ...
 *   }
 * })
 * ```
 */
function createRule<TOptions extends readonly unknown[], TMessageIds extends string>({
    create,
    defaultOptions,
    meta,
}: Readonly<RuleWithMeta<TOptions, TMessageIds>>): RuleModule<TOptions> {
    return {
    /**
     * Creates the rule listener with merged options.
     *
     * This wraps the user's create function to merge default options with
     * user-provided options before passing them to the rule implementation.
     *
     * Type assertion rationale:
     * - TypeScript ESLint's RuleContext is structurally compatible with base ESLint's RuleContext at runtime
     * - However, TypeScript sees them as incompatible due to additional methods in TS ESLint types
     * - We cast through `unknown` to explicitly bridge between these two type systems
     */
        // eslint-disable-next-line rad/no-as-unknown-as -- bridging TS ESLint and base ESLint type systems
        create: ((context: Readonly<RuleContext<TMessageIds, TOptions>>): RuleListener => {
            // Merge each option object with its corresponding default
            // eslint-disable-next-line rad/no-as-unknown-as -- merging option objects requires type cast
            const mergedOptions = context.options.map((userOption, optionIndex) => {
                const defaultOption = defaultOptions?.[optionIndex];
                const isDefaultObject = typeof defaultOption === "object" && defaultOption !== null;
                const isUserOptionObject = typeof userOption === "object" && userOption !== null;

                // If both are objects, merge them; otherwise use the user option or default
                return {
                    ...(isDefaultObject ? defaultOption : {}),
                    ...(isUserOptionObject ? userOption : {}),
                };
            }) as unknown as TOptions;

            return create(context, mergedOptions);
        }) as unknown as Rule.RuleModule["create"],

        // @ts-expect-error -- defaultOptions may be undefined, fallback to empty array
        defaultOptions: defaultOptions ?? [],
        /**
         * Meta property type assertion:
         * - TypeScript ESLint meta types are more specific than base ESLint meta types
         * - Both are structurally compatible at runtime
         * - Cast through `unknown` to bridge type systems
         */
        // eslint-disable-next-line rad/no-as-unknown-as -- bridging TS ESLint and base ESLint meta types
        meta: meta as unknown as Rule.RuleModule["meta"],
    };
}

/**
 * Primary rule creator with automatic documentation URL generation.
 *
 * This is the main export used throughout the codebase to create ESLint rules.
 * It automatically generates documentation URLs based on whether the rule has
 * dedicated markdown documentation or uses test files as documentation.
 *
 * @example
 * ```ts
 * export default createEslintRule({
 *   name: 'my-rule',
 *   meta: {
 *     type: 'problem',
 *     docs: { description: 'My custom rule' }
 *   },
 *   defaultOptions: [],
 *   create(context, options) {
 *     return {
 *       // ... rule implementation
 *     }
 *   }
 * })
 * ```
 */
/**
 * The return type from createRuleFactory has a complex inferred signature.
 * We explicitly cast through `unknown` to our desired public API surface,
 * which provides a cleaner generic interface for rule authors.
 *
 * Type safety rationale:
 * - `createRuleFactory` returns a correctly typed function internally
 * - We're narrowing to a more specific, user-friendly signature
 * - Using `unknown` as intermediate step ensures intentional type casting
 */
// eslint-disable-next-line rad/no-as-unknown-as -- narrowing to user-friendly signature
export const createEslintRule = createRuleFactory(
    ruleName => {
        const fileExtension = rulesWithDedicatedDocs.includes(ruleName) ? "md" : "test.ts";
        return `${ruleDocumentationBaseUrl}${ruleName}.${fileExtension}`;
    },
) as unknown as <TOptions extends readonly unknown[], TMessageIds extends string>({
    name,
    meta,
    ...rule
}: Readonly<RuleWithMetaAndName<TOptions, TMessageIds>>) => RuleModule<TOptions>;

/**
 * Set of warning messages that have already been logged.
 * Used to prevent duplicate warnings during rule execution.
 */
const loggedWarnings = new Set<string>();

/**
 * Logs a warning message only once during the lifetime of the process.
 *
 * This prevents console spam when the same warning condition is encountered
 * multiple times during linting operations.
 *
 * @param message - The warning message to display
 *
 * @example
 * ```ts
 * if (deprecatedFeatureUsed) {
 *   warnOnce('Feature X is deprecated, use Y instead')
 * }
 * ```
 */
export function warnOnce(message: string): void {
    if (loggedWarnings.has(message)) {
        return;
    }
    loggedWarnings.add(message);
    console.warn(message);
}

/**
 * AST node interface representing any ESTree node.
 */
interface ASTNode {
    type: string;
    [key: string]: unknown;
}

/**
 * Creates a type-checking function for AST nodes.
 *
 * Returns a predicate function that checks if a given node matches
 * the specified AST node type.
 *
 * @param nodeType - The ESTree node type to check for (e.g., 'Literal', 'Identifier')
 * @returns Predicate function that returns true if node matches the type
 *
 * @example
 * ```ts
 * const isIdentifier = createNodeTypeChecker('Identifier')
 * if (isIdentifier(node)) {
 *   // node is an Identifier
 * }
 * ```
 */
function createNodeTypeChecker(nodeType: string) {
    return (node: unknown): node is ASTNode => {
        return (
            typeof node === "object"
            && node !== null
            && "type" in node
            && (node as ASTNode).type === nodeType
        );
    };
}

/**
 * Checks if an AST node is a Literal node.
 *
 * @param node - The node to check
 * @returns True if the node is a Literal type
 *
 * @example
 * ```ts
 * if (isLiteral(node)) {
 *   // node represents a literal value like a string, number, or boolean
 * }
 * ```
 */
export const isLiteral = createNodeTypeChecker("Literal");
