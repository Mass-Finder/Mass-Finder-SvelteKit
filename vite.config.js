import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port:8080,
	},
	resolve: {
		alias:{
			$stores: resolve('./src/stores'),
			$lib: resolve('./src/lib'),
		}
	}
});
