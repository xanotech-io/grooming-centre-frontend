export default function override(config) {
  config.module.rules[1].oneOf.forEach((rule) => {
    if (rule.loader && rule.loader.includes("babel-loader")) {
      rule.options.plugins = [
        ...(rule.options.plugins || []),
        "@babel/plugin-proposal-nullish-coalescing-operator",
      ];
    }
  });
  return config;
};