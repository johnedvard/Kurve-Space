const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const JsonMinimizerPlugin = require('json-minimizer-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const devEnv = require('./development.env.js');

module.exports = (env) => {
  console.log(env);
  return {
    entry: {
      client: {
        import: './client/index.js',
        filename: 'bundle.js',
      },
    },
    mode: 'production',
    devtool: 'inline-source-map',

    plugins: [
      new HtmlWebpackPlugin({
        title: 'Kurve Space',
        template: path.resolve(__dirname, 'client/index.html'),
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'client/assets'),
            to: path.resolve(__dirname, 'dist/assets'),
          },
          {
            from: path.resolve(__dirname, 'client/style.css'),
            to: path.resolve(__dirname, 'dist/style.css'),
          },
          {
            from: path.resolve(__dirname, 'common/'),
            to: path.resolve(__dirname, 'server/common'),
          },
        ],
      }),
      new webpack.DefinePlugin({
        'process.env': env.target
          ? JSON.stringify(require(`./${env.target}.env.js`))
          : JSON.stringify({ TARGET: 'production' }),
      }),
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      fallback: {
        path: require.resolve('path-browserify'),
      },
    },
    devServer: {
      contentBase: path.resolve(__dirname, 'dist'),
      port: 9000,
    },
    optimization: {
      minimize: true,
      usedExports: true,
      minimizer: [
        // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
        `...`,
        new JsonMinimizerPlugin(),
        new HtmlMinimizerPlugin({
          test: /\.html/i,
        }),
        new CssMinimizerPlugin({
          test: /\.css$/i,
        }),
        new UglifyJsPlugin({
          test: /\.js(\?.*)?$/i,
        }),
      ],
    },
  };
};
