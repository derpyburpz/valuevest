// module.exports = function(api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       '@babel/plugin-proposal-export-namespace-from',
//       'react-native-reanimated/plugin',
//       'react-native-dotenv',
//     ],
//   };
// };

module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', 'module:metro-react-native-babel-preset'],
    plugins: [
      'react-native-reanimated/plugin',
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        safe: true,
        allowUndefined: true,
      }],
    ],
  };
};