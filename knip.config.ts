export default {
  // The schema URL for JSON validation in editors
  $schema: 'https://unpkg.com/knip@5/schema.json',

  // Exit with non-zero code (1) if there are any configuration hints
  // Configuration hints are suggestions from Knip about potential config improvements
  // Default: false
  treatConfigHintsAsErrors: false,

  // ESLint configuration
  // Disabling ESLint plugin to avoid "config.flatMap is not a function" error
  eslint: false, // Setting to false disables the ESLint plugin completely

  // Custom compilers (advanced feature, available only in .ts/.js config files)
  // Allows overriding built-in compilers or adding custom compilers for additional file types
  // Example: compilers: { '.mdx': (text) => compiler(text) }
  // Uncomment and configure if you need custom file type processing
  // compilers: {},

  // Default entry file patterns - starting points for dependency analysis
  // If not specified, defaults to:
  // [
  //   "{index,cli,main}.{js,cjs,mjs,jsx,ts,cts,mts,tsx}",
  //   "src/{index,cli,main}.{js,cjs,mjs,jsx,ts,cts,mts,tsx}"
  // ]
  // IMPORTANT: Specify your application's entry points here for accurate unused code detection
  entry: ['src/eslint.config.ts'],

  // Default project file patterns - all files to consider in the analysis
  // If not specified, defaults to: ["**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}!"]
  // The "!" suffix indicates production mode patterns (patterns without "!" are for default mode)
  // IMPORTANT: Define all files that should be analyzed for unused code
  project: [
    // Add custom project files here if needed
    // Examples: "src/**/*.ts", "apps/**/*.ts", "!**/*.test.ts"
  ],

  // Paths to resolve module aliases (similar to tsconfig paths)
  paths: {
    // Example: "@lib": ["./lib/index.ts"], "@lib/*": ["./lib/*"]
  },

  // Files and patterns to ignore from analysis
  // Files excluded here won't be checked for unused imports or reported as unused
  ignore: [
  ],

  // Binaries to ignore even if used but not provided by any dependency
  ignoreBinaries: [
    'knip', // knip itself is often used in scripts
    // Example: "zip", "docker-compose", "pm2-.+"
  ],

  // Dependencies to ignore in the analysis
  ignoreDependencies: ['@rad/config', '@rad/eslint', 'tsx', 'eslint', 'typescript', 'vitest', '@vitest/coverage-v8'],

  // Class and enum members to ignore
  ignoreMembers: [
    // Example: "render", "on.+"
  ],

  // Unresolved imports to ignore
  ignoreUnresolved: [
    // Example: "ignore-unresolved-import", "#virtual/.+"
  ],

  // Workspaces to ignore
  ignoreWorkspaces: [
    // Example: "packages/specific-package", "packages/prefix-*"
  ],

  // IMPORTANT: Set to TRUE to report exports that are only used within the same file
  // This helps find truly unused code even if it's referenced internally
  // Can be configured per-type: { interface: true, type: true }
  ignoreExportsUsedInFile: false,

  // IMPORTANT: Set to TRUE to report unused exports in entry files
  // Default is FALSE (entry file exports are considered "public API")
  // Enable this to find unused exports in your main module exports
  includeEntryExports: false,

  // Rules configuration for controlling issue reporting
  // This is where you can fine-tune what types of unused code to detect
  rules: {
    // shame, this doesn't seem to work.
    // the imports in apps/rad/src are not being recognized
    dependencies: 'error', // Report unused dependencies as errors
    unlisted: 'error', // Report unlisted dependencies as errors

    // IMPORTANT: These are the key rules for finding unused code
    files: 'error', // Report files that aren't imported anywhere
    exports: 'error', // Report exports not used in other files
    types: 'error', // Report unused exported types, interfaces, etc.
    enumMembers: 'error', // Report unused enum members
    classMembers: 'off', // Report unused class members (disabled by default)

    // Namespace-related rules (disabled by default)
    nsExports: 'off', // Report exports in used namespaces
    nsTypes: 'off', // Report types in used namespaces

    // Other rules
    duplicates: 'error', // Report duplicate exports
    unresolved: 'error', // Report unresolved imports
    binaries: 'error', // Report unlisted binaries
  },

  // Include specific issue types in the report (overrides rules)
  // Use this to enable specific issue types you want to focus on
  include: [
    // Example: Enable unused class members detection
    // "classMembers"
  ],

  // Exclude specific issue types from the report (overrides rules)
  // Use this to disable specific issue types you want to ignore
  exclude: [
    // Example: Ignore duplicate exports
    // "duplicates"
  ],

  // Control which tagged exports to include (+) or exclude (-) from analysis
  // Use this with JSDoc/TSDoc tags to exclude specific exports
  tags: [
    // Example: "-internal" would exclude exports tagged with @internal
  ],

  typescript: {
    config: ['./tsconfig.json'],
  },

  // Vitest configuration
  vitest: {
    config: [
      'vitest*.config.{js,mjs,ts,cjs,mts,cts}',
      'vitest.{workspace,projects}.{ts,js,json}',
    ],
    entry: ['**/*.{bench,test,test-d,spec}.?(c|m)[jt]s?(x)'],
  },

  // Configuration for specific workspaces in a monorepo (if needed)
  workspaces: {
    // Example workspace configuration:
    // "packages/example": {
    //     entry: ["src/index.ts"],
    //     project: ["src/**/*.ts"],
    //     ignoreDependencies: ["some-dep"]
    // }
  },
}
