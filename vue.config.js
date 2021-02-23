const siteConfig = require('./site.config.json');
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
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
      }),
      new CopyWebpackPlugin([{
        from: path.join(__dirname, "docs"),
        to: path.join(__dirname, "dist/docs"),
        toType: "dir"
      }])
    ]
  }
}