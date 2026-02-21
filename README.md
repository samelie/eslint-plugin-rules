# @adddog/eslint-plugin-rules

Custom ESLint rules for monorepo development, designed to enforce consistent import patterns across workspace packages.

![Features](https://raw.githubusercontent.com/samradical/readme-images/refs/heads/main/crt-fs8.png)

- 🔧 Auto-fixable import violations
- 📦 Monorepo-aware package resolution
- ⚡ TypeScript-first with full type safety
- 🎯 Zero configuration required

## Installation

```bash
npm install --save-dev @adddog/eslint-plugin-rules
# or
pnpm add -D @adddog/eslint-plugin-rules
# or
yarn add -D @adddog/eslint-plugin-rules
```

## Usage

Add the plugin to your ESLint configuration:

### ESLint Flat Config (ESLint 9+)

```js
import adddogRules from '@adddog/eslint-plugin-rules'

export default [
  {
    plugins: {
      adddog: adddogRules,
    },
    rules: {
      'adddog/no-incorrect-pkg-imports': 'error',
    },
  },
]
```

### Legacy ESLint Config

```json
{
  "plugins": ["@adddog/eslint-plugin-rules"],
  "rules": {
    "@adddog/eslint-plugin-rules/no-incorrect-pkg-imports": "error"
  }
}
```

## Rules

### `no-incorrect-pkg-imports`

Prevents incorrect package imports in monorepo workspaces by enforcing the use of workspace scope (`@adddog`) instead of relative paths.

#### ❌ Incorrect

```typescript
// Relative path through packages directory
import { logger } from '../../../packages/logging/src'

// Relative path with /src
import { env } from '../../env/src/config'
```

#### ✅ Correct

```typescript
import { env } from '@adddog/env'
// Use workspace scope
import { logger } from '@adddog/logging'
```

#### Options

This rule has no options.

#### When Not To Use It

If you're not working in a monorepo with workspace packages, this rule is unnecessary.

## Type Safety

This plugin exports TypeScript types for better ESLint configuration type checking:

```typescript
import type { RuleOptions, Rules } from '@adddog/eslint-plugin-rules'

const config = {
  rules: {
    'adddog/no-incorrect-pkg-imports': 'error',
  } satisfies Partial<Rules>,
}
```

## Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build the plugin for distribution |
| `pnpm lint` | Lint source files |
| `pnpm lint:fix` | Auto-fix linting issues |
| `pnpm types` | Run TypeScript type checking |
| `pnpm test` | Run test suite |
| `pnpm dev` | Development mode |

### Requirements

- Node.js >= 22
- pnpm >= 10

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-rule`)
3. Commit your changes (`git commit -m 'feat: add amazing rule'`)
4. Push to the branch (`git push origin feature/amazing-rule`)
5. Open a Pull Request

## License

MIT

## Links

- [Repository](https://github.com/samelie/eslint-plugin-rules)
- [Issues](https://github.com/samelie/eslint-plugin-rules/issues)
- [Changelog](https://github.com/samelie/eslint-plugin-rules/releases)
