const path = require('path');

module.exports = {
    target: 'node',

    entry: "./api/server.ts",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: [/node_modules/],
                include: [/api/, ],
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        path: path.resolve(__dirname, 'dist'), // 输出目录
        filename: "server.js", // 需要跟你在src文件夹中导出文件的文件名一致
        globalObject: "this",
        libraryTarget: "umd", //支持库的引入方式
    },
};
