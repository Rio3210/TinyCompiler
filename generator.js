class Generator {
  constructor(value) {
    this.tokens = value;
    this.datatype = {
      char: ".byte",
      int: ".word",
      float: ".float",
    };
    this.operator = {
      "+": "add",
      "-": "sub",
      "*": "mul",
      "/": "div",
    };
    this.equalities = {
      "==": "eq",
      "!=": "ne",
      "<=": "le",
      ">=": "ge",
      "<": "lt",
      ">": "gt",
    };
    this.inverse = {
      "==": "ne",
      "!=": "eq",
      "<=": "gt",
      ">=": "lt",
      "<": "ge",
      ">": "le",
    };
    this.io = { input: true, output: true };
    this.syscall = {
      int: 1,
      float: 2,
      double: 3,
      char: 4,
    };

    this.declared = [];
    this.datasection = [".data", "\n"];
    this.mainsection = [".text", "\n", "\t.main\n"];
    this.functions = [];
  }

  evaluate(value) {
    let tokens = this.tokens;
    if (value) {
      tokens = value;
    }

    for (let l = 0; l < tokens.length; l++) {
      const i = tokens[l];
      // console.log('i--------------S');

      // console.log(i["block"])
      // console.log("i--------------E");

      if (i["block"] == "line" && i["type"] in this.io) {
        const evaled = this.inout(i);
        this.mainsection.push(evaled);
      } else if (i["block"] == "line" && i["type"] == "declaration unkown") {
        this.datasection.push(
          "\t" + i["name"] + ": " + this.datatype[i["data"]] + "\n"
        );
      } else if (i["block"] == "line") {
        this.line(i, this.mainsection);
      } else if (i["block"] == "if") {
        if (i["level"] == 0) {
          this.mainsection.push("\tli $t0, 0\n");
        }
        this.ifstatment(i, this.mainsection, l);
      } else if (i["block"] == "while") {
        this.loop(i, this.mainsection, l);
      }
    }

    const data = this.datasection.join("");
    const main = this.mainsection.join("");
    this.functions.push("\thalt: \n");
    const func = this.functions.join("");

    return data + main + func;
  }

  inout(value) {
    let temp = [];
    if (value.type === "output") {
      if (value.data === "int") {
        temp.push(`li $v0, 1\nlw $a0, ${value.name}\nsyscall\n`);
      } else if (value.data === "float") {
        temp.push(`li $v0, 2\nlwc1 $f12, ${value.name}\nsyscall\n`);
      } else if (value.data === "double") {
        temp.push(`li $v0, 3\nlsc1 $f12, ${value.name}\nsyscall\n`);
      } else if (value.data === "char") {
        temp.push(`li $v0, 11\nlw $a0, ${value.name}\nsyscall\n`);
      }
    } else if (value.type === "input") {
      if (value.data === "int") {
        temp.push(`li $v0, 5\nsyscall\nsw $v0, ${value.name}\n`);
      } else if (value.data === "float") {
        temp.push(`li $v0, 6\nsyscall\n\nswc1 $f0, ${value.name}\n`);
      } else if (value.data === "float") {
        temp.push(`li $v0, 7\nsw $f12, ${value.name}\nsyscall\n`);
      } else if (value.data === "char") {
        temp.push(`li $v0, 12\nsw $a0, ${value.name}\nsyscall\n`);
      }
    }

    return temp.join("");
  }

  ifstatment(block, section, l) {
    const cond = block.condition;
    if (cond === "last") {
      section.push(`tbeq $t0, 0, ConditionIf${l}${block.level}\n`);
    } else {
      section.push(this.condition(cond[0], 1));
      section.push(this.condition(cond[2], 2));
      section.push(
        `tb${this.equalities[cond[1][1]]}, $t1, $t2, ConditionIf${l}${
          block.level
        }\n`
      );
    }

    const newSection = [`\tConditionIf${l}${block.level}:\n`];
    for (let i = 0; i < block.lines.length; i++) {
      this.line(block.lines[i], newSection);
    }
    newSection.push("\tadd $t0, $t0, 1 \n");
    this.functions.push(newSection.join(""));
  }

  loop(block, section, l) {
    const temp = ["\twhile:\n"];
    const cond = block.condition;
    temp.push("\t" + this.condition(cond[0], 1));
    temp.push("\t" + this.condition(cond[2], 2));
    temp.push(`\tb${this.inverse[cond[1][1]]}, $t1, $t2 halt\n`);

    for (let i = 0; i < block.lines.length; i++) {
      this.line(block.lines[i], temp);
    }
    temp.push("\tj while\n");

    section.push(temp.join(""));
  }

  condition(value, i) {
    if (value[0] === "identifier") {
      return `\tlw $t${i}, ${value[1]}\n`;
    } else {
      return `\tli $t${i}, ${value[1]}\n`;
    }
  }

  line(token, scope) {
    let temp = [];
    if (token.type in this.io){
        temp.push(this.inout(token))
        scope.append(temp.join(""))
    }
    if (token["type"] === "declaration") {
      
      if (!(token["name"] in this.declared)) {
        temp.push("\t" + token["name"]);
        this.declared.push(token["name"]);
        temp.push(": ");
        temp.push(this.datatype[token["data"]]);
        temp.push(" \n");
      }

      this.datasection.push(temp.join(""));
      scope.push(this.operate(token["value"], token["name"], token["data"]));
    }
  }

  operate(value, name, data) {
    let temp = [];
    if (value[0][0] === "identifier") {
      if (data === "char") {
        temp.push("tlb $t0," + value[0][1] + "\n");
        temp.push("tsb $t0, " + name + "\n");
        return temp.join("");
      } else {
        temp.push("\tlw $t0," + value[0][1] + "\n");
      }
    } else {
      temp.push("\tli $t0," + value[0][1] + "\n");
    }
    for (let i = 1; i < value.length; i += 2) {
      let op = value[i],
        val = value[i + 1];

      if (val[0] === "identifier") {
        temp.push("\tlw $t7, " + val[1] + "\n");
        temp.push("\t" + this.operator[op[1]] + " $t0, $t0, $t7" + "\n");
      } else {
        temp.push("\t" + this.operator[op[1]] + " $t0, $t0, " + val[1] + "\n");
      }
    }
    temp.push("\tsw $t0, " + name + "\n");
    return temp.join("");
  }
}

// module.exports = Generator;
export default Generator;
