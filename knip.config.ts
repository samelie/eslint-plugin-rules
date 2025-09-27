import config from "../config/knip.config.ts";

export default {
    ...config,
    entry: ["src/index.ts", "src/**/__tests__/**/*.test.ts"],
    project: ["src/**/*.ts"],
    paths: {
    },
    ignoreDependencies: [
        ...(config.ignoreDependencies || []),
    ],
    typescript: {
        config: ["./tsconfig.json"],
    },
};
