function a() {
  console.log("a");
}

function notExported() {
  console.log("notExported");
}

module.exports = {
  a,
};
