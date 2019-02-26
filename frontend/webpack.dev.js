const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '9060';

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    host: HOST,
    port: PORT,
    compress: true,
    inline: true,
    historyApiFallback: true,
    hot: true,
    overlay: true,
    open: true,
    setup(app) {
      //
      // HACK, change the URL to return the index.html for the operators page with versions
      // the .'s in the path keep the historyApiFallback from working
      // glad this is only dev mode ;)
      //
      app.use((req, res, next) => {
        const versionRegEx = /v(\d+\.)(\d+\.)(\d)/;
        if (versionRegEx.test(req.url)) {
          req.url = '/';
        }
        next();
      });
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  output: {
    publicPath: '/'
  }
});
