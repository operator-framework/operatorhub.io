const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    filename: '[name].[chunkhash:6].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/static/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'app-bundle.[contenthash:6].css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.s?css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './'
            }
          },
          { loader: 'cache-loader' },
          { loader: 'thread-loader' },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              outputStyle: 'compressed'
            }
          }
        ]
      },
      {
        test: /\.(woff2?|ttf|eot|otf)(\?.*$|$)/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]'
          }
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)(\?.*$|$)/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'images/[name].[ext]'
          }
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 50000,
      maxSize: Infinity,
      minChunks: 1,
      maxAsyncRequests: 3,
      maxInitialRequests: 2,
      automaticNameDelimiter: '~',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial'
        },
        async_vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -5,
          chunks: 'async',
          enforce: true
        },
        common: {
          minChunks: 2,
          priority: -20
        }
      }
    }
  }
};
