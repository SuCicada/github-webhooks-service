import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePluginNode } from 'vite-plugin-node';
import packageJson from "./package.json";
// import legacy from '@vitejs/plugin-legacy';

const dependencies = Object.keys({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
});
export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'api/index.ts'),
            fileName: 'index',
            name: 'index',
            formats: [
            // "cjs",
            'umd'
            ]
        },
        rollupOptions: {
            external: [],
            output: {
                inlineDynamicImports: true,
                entryFileNames: 'github-webhooks-service.js',
            }
        },
        target: 'node18',
        outDir: 'dist',
        // minify: true,
        sourcemap: false,
        emptyOutDir: true,
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
        VitePluginNode({
            adapter: 'express',
            appPath: './api/index.ts',
            // exportName: 'viteNodeApp',
            tsCompiler: 'esbuild',
        })
    ],
    optimizeDeps: {
        exclude: [
            // "*",
            // "@octokit/rest"
            'path', 'fs', 'os', // 确保这些核心模块不会被优化外部化
            ".prisma/*",

        ],
    },
    ssr: {
        noExternal: [
            '*', // 确保 express 被正确打包
            // "@octokit/rest",
            "@*",
            "@*/*",
            ".prisma/*",
            ...dependencies
        ],
    }
});
