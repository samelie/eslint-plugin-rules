import type { ESLint, Linter } from 'eslint'
import noIncorrectPkgImports from './rules/no-incorrect-pkg-imports'

/**
 * ESLint plugin for custom monorepo rules.
 *
 * This plugin provides custom ESLint rules tailored for monorepo development,
 * helping enforce consistent import patterns across workspace packages.
 */
const plugin = {
  meta: {
    name: 'adddog',
  },
  rules: {
    'no-incorrect-pkg-imports': noIncorrectPkgImports,
  },
} satisfies ESLint.Plugin

export default plugin

/**
 * Type representing the rules defined in this plugin.
 */
type RuleDefinitions = (typeof plugin)['rules']

/**
 * Maps each rule name to its default options configuration.
 *
 * This allows consumers to understand what options are available
 * for each rule in the plugin.
 */
export type RuleOptions = {
  [K in keyof RuleDefinitions]: RuleDefinitions[K]['defaultOptions'];
}

/**
 * Maps each rule name to a properly typed Linter.RuleEntry.
 *
 * Use this type when configuring rules in ESLint configuration files
 * to get proper type checking for rule options.
 *
 * @example
 * ```ts
 * const config: Linter.Config = {
 *   rules: {
 *     'adddog/no-incorrect-pkg-imports': 'error'
 *   } satisfies Partial<Rules>
 * }
 * ```
 */
export type Rules = {
  [K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>;
}
