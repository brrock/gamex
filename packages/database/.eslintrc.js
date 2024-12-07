module.exports = {
  root: true,
  extends: ["configs/eslint"],
  ignorePatterns: require("fs")
    .readFileSync(".prettierignore", "utf8")
    .split("\n")
    .filter(Boolean),
};
