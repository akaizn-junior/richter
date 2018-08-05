const path = require('path');
const config = require('./package.json');

//config the environment
require('dotenv').config();

//check the environment
const PROD_ENV = process.env.NODE_ENV === 'production';

module.exports = {
    mode: process.env.NODE_ENV,
    entry: path.join(__dirname, config.main),
    devtool: 'source-map',
    output: {
        //if in production mode show that the file is minified
        filename: `${process.env.NAME}.min.js`,
        library: process.env.NAME.charAt(0).toUpperCase() + process.env.NAME.slice(1),
        libraryTarget: process.env.TARGET,
        path: path.join(__dirname, 'dist', process.env.TARGET, config.version)
    },
    plugins: [],
    module: {
        rules: [
            {
                //transpile es6 in all the .js files
                test: /\.js$/,
                //don't transpile code in the node modules folder
                exclude: /node_modules/,
                use: {
                    //use the babel loader with cache for performance improvements
                    //cache improves the performance by 2 according to the docs
                    loader: 'babel-loader?cacheDirectory=true',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    }
}
