module.exports = {
  extends: ['airbnb-base', 'plugin:promise/recommended', 'prettier'],
  plugins: ['import', 'promise', 'prettier', 'prefer-arrow'],
  rules: {
    indent: ['off'], // trust prettier
    'prefer-arrow-callback': 'error',
    'no-console': 'off',
    'no-use-before-define': ['off'],
    'no-restricted-globals': 'warn',
    'prefer-promise-reject-errors': 'warn',
    'promise/catch-or-return': 'warn',
    'promise/always-return': 'warn',
    'import/no-unresolved': ['off'],
    'import/named': 'error',
    'import/prefer-default-export': ['off'],
    'import/no-extraneous-dependencies': ['off'],
    'prefer-arrow/prefer-arrow-functions': [
      'error',
      {
        disallowPrototype: true,
        singleReturnOnly: true,
        classPropertiesAllowed: false,
      },
    ],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
        proseWrap: 'always',
        tabWidth: 2,
      },
    ],
    'prefer-destructuring': ['error', { object: true, array: true }],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'block-like', next: 'block-like' },
      { blankLine: 'always', prev: ['case', 'default'], next: '*' },
    ],
  },
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
};
