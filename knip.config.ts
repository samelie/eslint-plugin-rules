import { defineKnipConfig } from "@adddog/monorepo-consistency";

export default defineKnipConfig({
    entry: ["src/index.ts"],
    project: ["src/**/*.ts"],
}, {
    ignoreDependencies: [
        "@adddog/monorepo-consistency",
    ],
    ignoreBinaries: [
        "knip",
        "tsx",
    ],
});
