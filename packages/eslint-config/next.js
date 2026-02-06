import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-plugin-prettier/recommended';

import { baseConfig } from './base.js';

export const nextJsConfig = defineConfig([
  prettier,
  ...nextVitals,
  ...nextTs,
  baseConfig,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': 'error',
      'react/no-unescaped-entities': 'off',
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: false,
          shorthandFirst: true,
          ignoreCase: true,
          reservedFirst: false,
        },
      ],
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);
