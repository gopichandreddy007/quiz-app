import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

// tests run in a fake browser (jsdom) so components can be rendered and clicked
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  }),
)
