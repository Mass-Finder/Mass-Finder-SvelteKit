import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodeLoaderPlugin } from '@vavite/node-loader/plugin';
import { resolve } from 'path';

/** @type {import('vite').UserConfig} */
export default defineConfig(({ mode }) => {
    let plugins = [sveltekit()];
    if (mode === 'development') {
        plugins = [nodeLoaderPlugin(), ...plugins];
    }

    return {
        plugins,
        server: {
            port: 8080,
        },
        resolve: {
            alias: {
                $stores: resolve('./src/stores'),
                $lib: resolve('./src/lib'),
            }
        }
    };
});