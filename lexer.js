class Lexer {
  constructor(line) {
    this.keywords =
      "auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|string|class|struc|include";
    this.operators = new RegExp("(\\++)|(-)|(=)|(\\*)|(/)|(%)|(--)|(<=)|(>=)");
    this.numerals = new RegExp("^(\\d+)$");
    this.characters = new RegExp(
      "[\\[@&~!#$\\^\\|{}\\]:;<>?,\\.']|(\\(\\))|(\\()|(\\))|\\{\\}|\\[\\]|\""
    );
    this.identifiers = new RegExp("^[a-zA-Z_]+[a-zA-Z0-9_]*");
    this.headers = new RegExp("[a-zA-Z]+\\.h");

    this.word = line; //[ 'int a = 10;' ]
  }

  lexe(Source_Code) {
    let display_counter = 0;
    let Identifiers_Output = [];
    let Keywords_Output = [];
    let Symbols_Output = [];
    let Operators_Output = [];
    let Numerals_Output = [];
    let Headers_Output = [];
    let output = [];
    let count = 0;

    for (let line of this.word) {
      count++;
      let tokens = line.startsWith("#include")
        ? line.split(" ")
        : line.match(/\S+/g) || [];

      let temp = [];
      // console.log(tokens);
      // console.log("------------------------------------");

      for (let token of tokens) {
        if (token.match(new RegExp(this.keywords))) {
          temp.push(["keyword", token]);
        } else if (token.match(new RegExp(this.headers))) {
          temp.push(["header", token]);
        } else if (token.match(new RegExp(this.operators))) {
          temp.push(["operator", token]);
        } else if (token.match(new RegExp(this.numerals))) {
          temp.push(["number", token]);
        } else if (token.match(new RegExp(this.characters))) {
          temp.push(["character", token]);
        } else if (token.match(new RegExp(this.identifiers))) {
          temp.push(["identifier", token]);
        }
      }

      output.push(temp);
    }

    return output;
  }
}

// module.exports = Lexer;

export default Lexer