const HtmlWebpackPlugin = require("html-webpack-plugin")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const TerserJSPlugin = require("terser-webpack-plugin")
const WebpackObfuscator = require("webpack-obfuscator")
const CopyPlugin = require("copy-webpack-plugin")
const MinimizerCSSPlugin = require("css-minimizer-webpack-plugin")
const nodeExternals = require("webpack-node-externals")
const webpack = require("webpack")
const path = require("path")
const Dotenv = require("dotenv-webpack")
const dotenv = require("dotenv")
let exclude = [/node_modules/, /dist/, /dist2/]
let webExclude = [...exclude, /server.tsx/, /routes/]
let nodeExclude = [...exclude]
const env = dotenv.config().parsed

let minimize = env.TESTING === "no"
let obfuscator = env.OBFUSCATE === "yes" ? [new WebpackObfuscator()] : []
let typecheck = env.TESTING === "no" ? [new ForkTsCheckerWebpackPlugin({typescript: {memoryLimit: 8192}})] : []
let hmr = env.TESTING === "yes" ? [new webpack.HotModuleReplacementPlugin()] : []
let scriptName = env.TESTING === "yes" ? "script.js" : "script.[contenthash:8].js"
let styleName = env.TESTING === "yes" ? "styles.css" : "styles.[contenthash:8].css"

module.exports = [
  {
    target: "web",
    entry: "./index",
    mode: env.TESTING === "yes" ? "development" : "production",
    node: {__dirname: false},
    devtool: env.TESTING === "yes" ? "eval-cheap-source-map" : false,
    output: {publicPath: "/", globalObject: "this", filename: scriptName, chunkFilename: "[id].js", path: path.resolve(__dirname, "./dist2/client")},
    resolve: {extensions: [".js", ".jsx", ".ts", ".tsx"], alias: {"react-dom$": "react-dom/profiling", "scheduler/tracing": "scheduler/tracing-profiling"}, 
    fallback: {fs: false, "process/browser": require.resolve("process/browser.js"), path: require.resolve("path-browserify"), vm: require.resolve("vm-browserify"),
    crypto: require.resolve("crypto-browserify"), stream: require.resolve("stream-browserify"), assert: require.resolve("assert/"), 
    zlib: require.resolve("browserify-zlib"), url: require.resolve("url/"), os: require.resolve("os/")}},
    performance: {hints: false},
    optimization: {minimize, minimizer: [new TerserJSPlugin({extractComments: false}), new MinimizerCSSPlugin(), ...obfuscator], moduleIds: "named", splitChunks: {chunks() {return false}}},
    module: {
      rules: [
        {test: /\.(jpe?g|png|gif|webp|svg|mp3|wav|mp4|webm|glb|obj|fbx|ttf|otf|zip)$/, exclude: webExclude, use: [{loader: "file-loader", options: {name: "[path][name].[ext]"}}]},
        {test: /\.(txt|sql)$/, exclude: webExclude, use: ["raw-loader"]},
        {test: /\.html$/, exclude: webExclude, use: [{loader: "html-loader", options: {sources: false, minimize: false}}]},
        {test: /\.css$/, exclude: webExclude, use: [{loader: MiniCssExtractPlugin.loader}, "css-loader"]},
        {test: /\.less$/, exclude: webExclude, use: [{loader: MiniCssExtractPlugin.loader}, "css-loader", {loader: "less-loader"}]},
        {test: /\.(tsx?|jsx?)$/, exclude: webExclude, use: [{loader: "ts-loader", options: {transpileOnly: true}}]}
      ]
    },
    plugins: [
      ...typecheck,
      ...hmr,
      new Dotenv(),
      new MiniCssExtractPlugin({
        filename: styleName,
        chunkFilename: "[id].css"
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "./index.html"),
        minify: false
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
      new CopyPlugin({
        patterns: [
          {from: "assets/misc/bitcrusher.js", to: "[name][ext]"},
          {from: "assets/misc/soundtouch.js", to: "[name][ext]"},
          {from: "assets/misc/webpxmux.wasm", to: "[name][ext]"},
          {from: "assets/misc/avif_enc.wasm", to: "[name][ext]"},
          {from: "assets/misc/jxl_enc.wasm", to: "[name][ext]"},
          {from: "assets/live2d/live2dcubismcore.min.js", to: "[name][ext]"}
        ]
      })
    ]
  }, 
  {
  target: "node",
    entry: "./server",
    mode: env.TESTING === "yes" ? "development" : "production",
    node: {__dirname: false},
    externals: [nodeExternals()],
    devtool: env.TESTING === "yes" ? "eval-cheap-source-map" : false,
    output: {filename: "server.js", chunkFilename: "[id].js", path: path.resolve(__dirname, "./dist2/server")},
    resolve: {extensions: [".js", ".jsx", ".ts", ".tsx"], 
    fallback: {zlib: require.resolve("browserify-zlib")}},
    performance: {hints: false},
    optimization: {minimize, minimizer: [new TerserJSPlugin({extractComments: false}), ...obfuscator], moduleIds: "named"},
    module: {
      rules: [
        {test: /\.(jpe?g|png|gif|webp|svg|mp3|wav|mp4|webm|glb|obj|fbx|ttf|otf|zip)$/, exclude: webExclude, use: [{loader: "file-loader", options: {name: "[path][name].[ext]"}}]},
        {test: /\.(txt|sql)$/, exclude: webExclude, use: ["raw-loader"]},
        {test: /\.html$/, exclude: nodeExclude, use: [{loader: "html-loader", options: {minimize: false}}]},
        {test: /\.css$/, exclude: nodeExclude, use: [{loader: MiniCssExtractPlugin.loader}, "css-loader"]},
        {test: /\.less$/, exclude: nodeExclude, use: [{loader: MiniCssExtractPlugin.loader}, "css-loader", {loader: "less-loader"}]},
        {test: /\.(tsx?|jsx?)$/, exclude: nodeExclude, use: [{loader: "ts-loader", options: {transpileOnly: true}}]}
      ]
    },
    plugins: [
      ...typecheck,
      ...hmr,
      new Dotenv(),
      new MiniCssExtractPlugin({
        filename: styleName,
        chunkFilename: "[id].css"
      }),
      new CopyPlugin({
        patterns: [
          {from: "index.html", to: "[name][ext]"}
        ]
      })
    ]
  }
]