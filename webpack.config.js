const path = require('path');

module.exports = {
    entry: './src/js/index2.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'waterfall.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    }
};