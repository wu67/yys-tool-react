/* eslint-disable */
module.exports = {
  env: {
    browser: true,
    es2021: true, // 添加所有 ECMAScript 2021 全局变量并自动将 ecmaVersion 解析器选项设置为 12
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'lasted',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react-refresh'],
  extends: [
    'prettier',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    'no-unused-vars': 1,
    'react-refresh/only-export-components': 1,
    // 允许any类型
    '@typescript-eslint/no-explicit-any': 0,
  },
}
