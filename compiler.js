

// const Checker = require("./Checker");
// const Lexer = require("./lexer");
// const Parser = require("./parser_1");
// const Generator = require("./generator");
// const fs = require("fs");
// import fs from "fs";

import Checker from "./Checker.js";
import Lexer from "./lexer.js";
import Parser from "./parser_1.js";
import Generator from "./generator.js";

function main(value) {
  // const lines = fs.readFileSync(value, "utf-8").split(/\r?\n/);

  const code = new Checker(value).returns();
  // console.log(code);
  const tokenized = new Lexer(code).lexe(code);
  // console.log(tokenized);

  const parsed = new Parser(tokenized).line(tokenized);
  // console.log(parsed);
  const generated = new Generator(parsed).evaluate(parsed);

  return generated;
}

// console.log(main("test.c"));

// module.exports = { main };
export default main;
