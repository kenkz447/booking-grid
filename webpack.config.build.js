const path = require('path')
const webpack = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        app: './src/index'
    },
    output: {
        publicPath: '/static/',
        path: path.join(__dirname, 'dist', 'static'),
        filename: '[name].[chunkhash].js',
        chunkFilename: '[name].[chunkhash].js'
    },
    optimization: {
        minimizer: [new UglifyJsPlugin({ cache: true, sourceMap: true })],
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all"
                }
            }
        },
    },
    plugins: [
        new webpack.DefinePlugin({
            'API_ENTRY': JSON.stringify('http://v2-api.furnituremaker.vn'),
            'FILE_HOST': JSON.stringify('http://v2-api.furnituremaker.vn'),
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new ExtractTextPlugin({
            filename: '[name].[hash].css',
            allChunks: true
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].[chunkhash].js.map',
            include: /\.js$/,
            exclude: [/vendors/g],
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            inject: 'body'
        })
    ],
    module: {
        rules: [{
            test: /\.tsx?$/,
            loaders: ['ts-loader', 'ts-nameof-loader']
        },
        {
            test: /\.(css|sass|scss|less)$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [{
                    loader: 'css-loader'
                }, {
                    loader: 'postcss-loader'
                }, {
                    loader: 'resolve-url-loader',
                }, {
                    loader: 'sass-loader',
                    options: {
                        includePaths: [path.resolve(__dirname, 'src')]
                    }
                }, {
                    loader: 'less-loader',
                    options: {
                        paths: [path.resolve(__dirname, "node_modules")],
                        javascriptEnabled: true,
                        modifyVars: {
                            '@blue-6': '#D39C01'
                        }
                    }
                }]
            })
        }, {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            use: [{
                loader: 'file-loader?name=fonts/[name].[ext]'
            }]
        },
        {
            test: /\.(jpe?g|png|gif|svg)$/i,
            exclude: /fonts/,
            use: [{
                loader: 'file-loader?name=images/[name].[ext]'
            }]
        }
        ]
    },
    resolve: {
        modules: [
            path.join(__dirname, 'src'),
            path.join(__dirname, 'src', 'scripts'),
            'node_modules'
        ],
        extensions: ['.js', '.ts', '.tsx'],
        plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })]
    }
}