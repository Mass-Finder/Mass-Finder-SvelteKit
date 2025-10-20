import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Optional: 빌드 결과가 저장될 폴더 경로를 지정합니다. 기본값은 'build'입니다.
			// pages: 'build',
			// assets: 'build',
			fallback: 'index.html',  // SPA 지원을 위한 fallback 페이지 설정
		}),
		// Optional: 경로 설정
		paths: {
			base: '',
			assets: ''
		}
	}
};

export default config;
