const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// typecheck TS sources before commit and push
// removed from prod to prevent Jenkins failure issues
// as ForkTsCheckerPlugin doesn't work well with Docker
module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: []
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false,
      checkSyntacticErrors: true,
      measureCompilationTime: true,
      tslint: false,
      useTypescriptIncrementalApi: false
    })
  ]
});
