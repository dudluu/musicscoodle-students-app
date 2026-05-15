/*const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'mjs'];

module.exports = config;*/


const { getDefaultConfig } = require('expo/metro-config'); // ✅ correct
module.exports = getDefaultConfig(__dirname);
