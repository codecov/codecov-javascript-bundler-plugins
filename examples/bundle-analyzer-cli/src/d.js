const { extra } = require("./nested/extra");
const { common } = require("./common");

function d() {
  console.log("d");
  common();
  extra();
}

module.exports = {
  d,
};
