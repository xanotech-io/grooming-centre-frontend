module.exports = function override(config) {
  config.module.rules[1].oneOf.forEach((rule) => {
    if (rule.loader && rule.loader.includes("babel-loader")) {
      rule.options.plugins = [
        ...(rule.options.plugins || []),
        "@babel/plugin-proposal-nullish-coalescing-operator",
      ];
    }
  });

  if (config.optimization) {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 2000000,
    };
  }

  return config;
};
