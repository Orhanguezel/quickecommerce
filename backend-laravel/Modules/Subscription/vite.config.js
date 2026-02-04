import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    build: {
        outDir: '../../public/build-subscription',
        emptyOutDir: true,
        manifest: true,
    },
    plugins: [
        laravel({
            publicDirectory: '../../public',
            buildDirectory: 'build-subscription',
            input: [
                __dirname + '/resources/asset/sass/app.scss',
                __dirname + '/resources/asset/js/app.js'
            ],
            refresh: true,
        }),
    ],
});