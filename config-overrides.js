const {
    override,
    addWebpackModuleRule,
    addWebpackPlugin,
} = require('customize-cra');
const Dotenv = require('dotenv-webpack');
// console.log(process.env)
module.exports = override(
    addWebpackModuleRule({
        test: /\.svg$/,
        use: [
            {
                loader: 'babel-loader',
            },
            {
                loader: 'react-svg-loader',
                options: {
                    jsx: true, // true outputs JSX tags
                },
            },
        ],
    }),
    addWebpackPlugin(
        // new Dotenv({
        //     path: './.env',
        // }),
        new Dotenv({
            path: `./.env.${process.env.NODE_ENV}`,
        }),
    ),
);
