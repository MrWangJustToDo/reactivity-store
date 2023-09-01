"use strict";

if (process.env.NODE_ENV === "production") {
  module.exports = require("./dist/cjs/react.production");
} else {
  module.exports = require("./dist/cjs/react.development");
}
