const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.config')

const port = process.env.npm_package_config_port || 3000
const host = process.env.npm_package_config_host || 'localhost'

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
    stats: {
        colors: true,
        chunks: false,
    },
    overlay: true
}).listen(port, host, function(err) {
    if (err) {
        console.log(err);
    }
    console.log(`Listening at http://${host}:${port}/`);
});