import { createEslintRule } from '../utils'

export const RULE_NAME = 'no-as-unknown-as'
export type MessageIds = 'noDoubleAssertion'
export type Options = []

/**
 * ESLint rule to prevent double type assertions via `as unknown as T`.
 *
 * This pattern bypasses TypeScript's type safety and should be avoided.
 * When you need to convert between incompatible types, use type guards
 * or fix the underlying type mismatch.
 *
 * ❌ Bad:
 * ```ts
 * const value = someValue as unknown as TargetType
 * ```
 *
 * ✅ Good:
 * ```ts
 * // Use proper type guards
 * if (isTargetType(someValue)) {
 *   const value = someValue
 * }
 *
 * // Or fix the types at the source
 * const value: TargetType = properlyTypedValue
 * ```
 */
export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbids `as unknown as T` double assertions',
    },
    schema: [],
    messages: {
      noDoubleAssertion: 'Avoid `as unknown as T` - bypasses type safety',
    },
  },
  defaultOptions: [],

  create(context) {
    return {
      TSAsExpression(node) {
        if (
          node.expression.type === 'TSAsExpression'
          && node.expression.typeAnnotation.type === 'TSUnknownKeyword'
        ) {
          context.report({
            node,
            messageId: 'noDoubleAssertion',
          })
        }
      },
    }
  },
})
