import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginZod } from '@kubb/plugin-zod'

export default defineConfig({
  root: '.',
  input: {
    path: './zentria-api.yaml',
  },
  output: {
    path: '.src/generated',
    clean: true,
  },
  plugins: [
    pluginOas(),
    pluginTs({
      output: {
        path: 'models',
      },
    }),
    pluginReactQuery({
      output: {
        path: 'hooks',
      },
    }),
    pluginZod({
      output: {
        path: 'zod',
      },
    }),
  ],
})
