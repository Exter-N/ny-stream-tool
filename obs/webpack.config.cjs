const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';

module.exports = {
  mode,
  entry: './src/index.ts',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].css',
    }),
    new VueLoaderPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/]
        },
      }, {
        test: /\.css$/,
        use: [
          /*mode !== 'production' ? 'style-loader' :*/ MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      }, {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: 'dist/',
  },
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: 'all',
      name: 'vendor',
    },
  },
  performance: {
    hints: false,
  },
  /*optimization: {
    minimizer: (mode !== 'production') ? [] : [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        minify: function (file, sourceMap) {
          const uglifyJsOptions = {
            output: {
              max_line_len: 1024,
            },
          };

          if (sourceMap) {
            uglifyJsOptions.sourceMap = {
              content: sourceMap,
            };
          }

          return require('terser').minify(file, uglifyJsOptions);
        },
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },*/
};