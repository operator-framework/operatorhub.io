const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
        terserOptions: {
          ecma: 6
        }
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './src/manifest.json' },
      { from: './src/browserconfig.xml' },
      { from: './src/imgs/favicon/*', to: 'ico', flatten: true }
    ])
  ]
});
