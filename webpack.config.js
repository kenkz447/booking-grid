const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: [
        `webpack-dev-server/client?http://${process.env.npm_package_config_host}:${process.env.npm_package_config_port}`,
        'webpack/hot/only-dev-server',
        'react-hot-loader/patch',
        './src/index',
    ],
    output: {
        publicPath: '/',
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            'API_ENTRY': JSON.stringify('http://v2-api.furnituremaker.vn'),
            'FILE_HOST': JSON.stringify('http://v2-api.furnituremaker.vn'),
        }),
        new ErrorOverlayPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
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
            use: [{
                loader: "style-loader"
            }, {
                loader: 'css-loader',
            }, {
                loader: "resolve-url-loader",
                options: {
                    silent: true
                }
            }, {
                loader: "sass-loader",
                options: {
                    includePaths: [path.resolve(process.cwd(), 'src')]
                }
            }]
        }, {
            test: /(\.less)$/,
            loader: 'less-loader',
            options: {
                paths: [path.resolve(__dirname, "node_modules")],
                javascriptEnabled: true,
                modifyVars: {
                    '@blue-6': '#D39C01'
                }
            }
        },
{
    test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [{
            loader: 'file-loader?name=[name].[ext]'
        }]
},
{
    test: /\.(jpe?g|png|gif|svg)$/i,
        use: [{
            loader: 'file-loader?name=[name].[ext]'
        }]
}
        ]
    },
resolve: {
    modules: ['node_modules'],
        extensions: ['.js', '.ts', '.tsx'],
            plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })]
}
};