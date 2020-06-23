const siteConfig = require('./site.config.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
siteConfig['BASE_URL'] = process.env.BASE_URL
module.exports = {
  publicPath: '/',
  pwa: {
    workboxPluginMode: 'GenerateSW',
      workboxOptions: {
          skipWaiting: true
      }
  },
  configureWebpack: {
    plugins: [
      new HtmlWebpackPlugin({
        templateParameters: siteConfig,
        template : './public/index.ejs'
    })
    ]
  }
}