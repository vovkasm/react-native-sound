// Our ESLint configuration (we use js format, bacause it can be commented)
module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    },
    sourceType: 'module'
  },
  plugins: [ 'classes', 'import' ],
  rules: {
    // indent blocks with 2 spaces because 4 too big for javascript callback chains + we have JSX with many elements
    indent: [ 'error', 2 ],
    // because )))
    'linebreak-style': [ 'error', 'unix' ],
    // Hmm... for unity, because we do not want to escape xml attrs in double quotes
    quotes: [ 'error', 'single' ],
    // Modern javascript has grammar that don't need statement separators
    semi: [ 'error', 'never' ],
    'no-duplicate-imports': [ 'error', {
        includeExports: true
      }
    ],
    // For readability (TODO: sort imports in same group)
    'import/order': ['error',{'newlines-between': 'always'}],
    // Enforse class naming rules
    'classes/name': [ 'error', 'class', 'method' ]
  }
}
