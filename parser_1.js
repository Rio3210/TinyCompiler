class Parser {
  constructor(value) {
    this.token = value;
    this.datatype = ["int", "char", "float", "double", "bool"];
    this.branch = ["if", "else", "else if", "while"];
    this.io = ["scanf", "printf"];
    this.declared = {};
  }

  // this is to evaluate the lines from lexer returns dictionary
  line(val) {
    let tokens = this.token;
    let output = [];
    if (val) {
      tokens = val;
    }
    let i = 0;
    const n = tokens.length;
    while (i < n) {
      let j = 0;
      while (i < n && this.branch.includes(tokens[i][0][1])) {
        const temp = { block: "if", level: j };
        if (tokens[i][0][1] === "while") {
          temp.block = "while";
          temp.condition = [tokens[i][2], tokens[i][3], tokens[i][4]];
        } else if (tokens[i][0][1] === "if") {
          temp.condition = [tokens[i][2], tokens[i][3], tokens[i][4]];
        } else if (tokens[i][0][1] === "else" && tokens[i][1][1] === "if") {
          temp.condition = [tokens[i][3], tokens[i][4], tokens[i][5]];
        } else {
          temp.condition = "last";
        }
        j += 1;
        i += 1;
        let newLines = [];
        while (tokens[i][0][1] !== "}") {
          newLines.push(this.lineEval(tokens[i]));
          i += 1;
        }
        i += 1;
        temp.lines = newLines;
        output.push(temp);
      }
      if (i < n && j === 0) {
        output.push(this.lineEval(tokens[i]));
      }
      i += 1;
    }
    return output;
  }

  lineEval(token) {
    const temp = { block: "line" };
    if (token[0][0] === "identifier" && token[0][1] in this.declared) {
      token = [["keyword", this.declared[token[0][1]]["data"]], ...token];
    }
    console.log((token[token.length-2][1])["type"])
    // console.log(token[0][1])
    // console.log()
    if (this.io.includes(token[0][1])) {
      // console.log(token[token.length-2][1])
      const identify = token[token.length-2][1];
      
      temp.name = identify;
      temp.data = this.declared[identify].data;
      console.log(temp.data)
      if (token[0][1] === "scanf") {
        temp.type = "input";
      }
       else {
        temp.type = "output";
      }
      return temp;
    } else if (this.datatype.includes(token[0][1])) {
      if (!token.some((t) => t[0] === "operator" && t[1] === "=")) {
        temp.type = "declaration unkown";
        temp.data = token[0][1];
        temp.name = token[1][1];
        temp.dimension = 1;
        if (token.some((t) => t[0] === "character" && t[1] === "[")) {
          temp.dimension = this.array(token);
        }
      } else {
        temp.type = "declaration";
        temp.data = token[0][1];
        temp.name = token[1][1];
        temp.dimension = 1;
        if (token.some((t) => t[0] === "character" && t[1] === "[]")) {
          const mapped = this.mapper(token, temp.data);
          temp.value = mapped;
          temp.dimension = mapped.length;
        } else {
          if (temp.data === "char") {
            temp.value = token.slice(4, token.length - 1);
          } else if (temp.data === "float") {
            temp.value = token.slice(3, token.length - 1);
          } else {
            temp.value = token.slice(3, token.length - 1);
          }
        }
      }
      this.declared[token[1][1]] = temp;
      return temp;
    }
  }

  array(token) {
    const i = token.findIndex((t) => t[0] === "character" && t[1] === "[");
    return parseInt(token[i + 1][1], 10);
  }

  mapper(token, data) {
    let i = token.findIndex((t) => t[0] === "character" && t[1] === "[]");
    i += 3;
    if (data === "char") {
      return [token[i][1]];
    }
    const stack = [];
    while (token[i][1] !== "};") {
      if (token[i][1] !== ",") {
        stack.push(token[i][1]);
      }
      i += 1;
    }
    stack.pop();
    return stack;
  }
}
// module.exports = Parser;
export default Parser;
