class Checker {
  constructor(value) {
    this.lines = value;
    this.code = this.removeComments();
    this.blockPass = this.blockChecker();
  }

  returns() {
    if (this.blockPass) {
      return this.code;
    }
    return "Error Blocking";
  }

  removeComments() {
    const answer = [];
    let block = false;
    let comment = false;
    let temp = [];
    let temp2 = [];
    let i = 0;
    let j = 0;
    while (i < this.lines.length) {
      let line = this.lines[i];
      if (line[0] === "#") {
        line = "\n";
      }
      if (line[line.length - 1] === "\n") {
        line = line.slice(0, -1);
      }
      j = 0;
      temp = [];
      while (j < line.length) {
        const word = line[j];
        j += 1;
        if (block) {
          if (word === "*" && line[j] === "/") {
            [temp, temp2] = [temp2, []];
            block = false;
            j += 1;
          }
          continue;
        } else if (word === "/" && j < line.length) {
          if (line[j] === "*") {
            [temp2, temp] = [temp, []];
            block = true;
            j += 1;
            continue;
          } else if (line[j] === "/") {
            break;
          }
        }
        temp.push(word);
      }
      const appended = temp.join("").trim();
      if (appended) {
        answer.push(appended);
      }
      i += 1;
    }
    return answer;
  }

  blockChecker() {
    // checks the correct block element is done
    const stack = [];
    const blockElements = new Set(["{", "(", "["]);
    const equiv = { "]": "[", ")": "(", "}": "{" };
    for (const line of this.code) {
      for (const word of line) {
        if (blockElements.has(word)) {
          stack.push(word);
        } else if (word in equiv) {
          if (!stack || stack.pop() !== equiv[word]) {
            return false;
          }
        }
      }
    }
    return stack.length === 0;
  }
}

// module.exports = Checker;
export default Checker;
