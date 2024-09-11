const { extra } = require("./nested/extra");
const { common } = require("./common");

function c() {
  console.log("c");
  extra();
  common();
}

module.exports = {
  c,
};
