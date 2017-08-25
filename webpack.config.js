const path = require('path');
const webpack = require('webpack');
const { AureliaPlugin } = require('aurelia-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => {
    let config = {
        entry: {
            app: 'aurelia-bootstrapper'
        },

        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name]-[hash].js',
            chunkFilename: '[name]-[chunkhash].js'
        },

        resolve: {
            extensions: [
                '.webpack.js',
                '.web.js',
                '.js',
                '.jsx',
                '.ts',
                '.tsx'
            ],
            modules: [
                'example',
                'node_modules'
            ],
            alias: {
                'swipeout': path.resolve('src'),
                'swipeout$': path.resolve('src/index.ts')
            }
        },

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'awesome-typescript-loader'
                },
                {
                    test: /\.html$/,
                    use: 'html-loader'
                },
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    sourceMap: true
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    sourceMap: true
                                }
                            }
                        ]
                    })
                }
            ]
        },

        plugins: [
            new AureliaPlugin(),
            new ExtractTextPlugin('[name]-[contenthash].css'),
            new HtmlWebpackPlugin({
                template: 'example/index.html'
            })
        ]
    };

    if (env === 'prod') {
        config.plugins.push(new webpack.optimize.UglifyJsPlugin());
        config.plugins.push(new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }));
    } else if (env === 'dev') {
        config.devtool = 'cheap-module-eval-source-map';
        config.devServer = {
            stats: 'errors-only'
        };
    }

    return config;
};
