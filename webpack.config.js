const webpack = require('webpack');
const Visualizer = require('webpack-visualizer-plugin');
// const pkg = require('../package.json');
// const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
// const ExtractTextPlugin = require("extract-text-webpack-plugin");


module.exports = {
    devtool: false,
    entry: {
        "index": ["./index.js"]
    },
    resolve: {
        // 当require的模块找不到时，自动添加这些后缀
        extensions: ['.js']
    },
    output: {
        path: __dirname + "/build",
        filename: '[name].js',
        // 用于本地开发的静态目录
        publicPath: '/dist/'
    },
    plugins: [
        // 作用域提升(scope hoisting)
        new webpack.optimize.ModuleConcatenationPlugin(),

        // 根据模块调用次数，给模块分配ids，常被调用的ids分配更短的id, 使得ids可预测，降低文件大小，该模块推荐使用
        new webpack.optimize.OccurrenceOrderPlugin(),

        // 限制打包文件的个数
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 15 }),

        // 把多个小模块进行合并，以减少文件的大小
        new webpack.optimize.MinChunkSizePlugin({ minChunkSize: 10000 }),

        // 定义node的打包环境
        new webpack.DefinePlugin({
            "process.env": { NODE_ENV: JSON.stringify('production') },
            DEBUG: false
        })
    ],
    module: {
        rules: [{
            test: /\.js$/,
            exclude: [/node_modules/],
            use: {
                loader: 'babel-loader'
            }
        }]
    }
}