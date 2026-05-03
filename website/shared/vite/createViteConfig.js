import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const workspaceRoot = path.resolve(fileURLToPath(new URL('../../', import.meta.url)))

export function createViteConfig(appDirectory, options = {}) {
  const appRoot = path.resolve(workspaceRoot, appDirectory)
  const {
    plugins = [],
    resolve: resolveOptions = {},
    build: buildOptions = {},
    ...restOptions
  } = options

  return defineConfig({
    root: appRoot,
    plugins: [react(), ...plugins],
    resolve: {
      alias: {
        '@': appRoot,
        '@shared': path.resolve(workspaceRoot, 'shared'),
        ...(resolveOptions.alias ?? {}),
      },
      ...resolveOptions,
    },
    build: {
      outDir: path.resolve(workspaceRoot, 'dist', appDirectory.toLowerCase()),
      emptyOutDir: true,
      ...buildOptions,
    },
    ...restOptions,
  })
}
