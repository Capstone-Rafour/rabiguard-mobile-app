const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro"); // 혹은 v5라면 withNativewind

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
