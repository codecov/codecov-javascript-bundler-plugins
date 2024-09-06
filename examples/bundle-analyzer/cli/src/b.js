const { d } = require("./d");
const { common } = require("./common");

function b() {
  console.log("b");
  d();
  common();
}

module.exports = {
  b,
};
