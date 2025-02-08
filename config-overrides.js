// This file is used to fix some issues arising with the use of plotly.js in this typescript project. It modifies some webpack settings.
const { override } = require('customize-cra');
const webpack = require('webpack');
const path = require('path');

module.exports = override(
    (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            process: require.resolve('process/browser'),
            buffer: require.resolve("buffer/"),
            stream: require.resolve("stream-browserify"),
            assert: require.resolve("assert/"),
        };

        config.resolve.extensions = [
            ...config.resolve.extensions,
            '.mjs',
          ];

        config.plugins = [
            ...config.plugins,
            new webpack.ProvidePlugin({
                Buffer: ["buffer", "Buffer"],
                process: "process/browser",
            }),
        ];

        return config;
    }
);
