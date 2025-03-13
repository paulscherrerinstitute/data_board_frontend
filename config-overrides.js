const { override } = require("customize-cra");
const webpack = require("webpack");

module.exports = override((config) => {
    config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "process/browser": require.resolve("process/browser.js"),
    };

    config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve("buffer/"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert/"),
    };

    config.plugins.push(
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        })
    );

    config.ignoreWarnings = [
        (warning) => warning.message.includes("Failed to parse source map"),
    ];

    return config;
});
