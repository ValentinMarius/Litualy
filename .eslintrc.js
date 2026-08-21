module.exports = {
  extends: ["expo", "prettier"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};
