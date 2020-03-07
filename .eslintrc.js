module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    "plugin:vue/essential",
    "eslint:recommended",
    'plugin:nuxt/recommended'
  ],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    "no-console": "off",
    "no-empty": [
      "error",
      {
        "allowEmptyCatch": true
      }
    ]
  }
}
