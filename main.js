import fs from "fs/promises";
import { RULES } from "./rules.js";

export default class Domlson {
  constructor() {
    this.variables = [];
  }

  async getSource(src) {
    try {
      const data = await fs.readFile(src, {
        encoding: "utf8",
      });
      return data;
    } catch (err) {
      console.error(err);
    }
  }

  typeCheck(val) {
    let tok;
    if (!isNaN(val)) {
      val = Number(val);
    } else if (val.startsWith('"') && val.endsWith('"')) {
      val = val.replaceAll('"', "");
    } else if (val === "true" || val === "false") {
      val = val === "true";
    } else if ((tok = RULES.groupFind.exec(val)) || val.length > 0) {
      let result;
      let objectName;
      if (tok) {
        result = tok[0].split(".");
        objectName = result[0];
        /* Shifting so, can access the object values without the object itself */
        result.shift();
      } else {
        result = null;
        objectName = null;
      }
      /* The part for nested objects */
      for (let el of this.variables) {
        if (el["object_name"] === objectName) {
          let objectVal = result.reduce((acc, key) => acc[key], el);
          val = objectVal;
        } else if (el["object_name"] === val) {
          val = el;
        }
      }
    } else {
      console.error("Undefined type: ", val);
      process.exit(0);
    }

    return val;
  }

  createTree(tok) {
    let variableName = tok[1].trim();
    let variableValue = tok[2].trim();

    let result = {};

    if (RULES.array.test(variableValue)) {
      let arrValues = tok[3].split(", ");
      let final = [];
      for (let val of arrValues) {
        let result = this.typeCheck(val);
        final.push(result);
      }
      result[variableName] = final;
    } else {
      let resultVal = this.typeCheck(variableValue);
      result[variableName] = resultVal;
    }

    return result;
  }
  async main(src) {
    let tok;
    let lines;
    let content = src;
    /* Final tokens list */
    let final = [];

    if (RULES.fileSource.test(src)) {
      content = await this.getSource(src);
      content = content.split("\r\n");
      if (!content) return;
    }

    content != src ? (lines = content) : (lines = content.trim().split("\n"));

    let line = 0;

    while (line < lines.length) {
      if ((tok = RULES.reference.exec(lines[line]))) {
        let myObject = {};
        myObject["object_name"] = tok[1];
        while (lines[line] !== "") {
          line++;
          if ((tok = RULES.definition.exec(lines[line]))) {
            let result = this.createTree(tok);
            myObject = { ...myObject, ...result };
          }
        }
        this.variables.push(myObject);
        final.push(myObject);
      } else if ((tok = RULES.definition.exec(lines[line]))) {
        final.push(this.createTree(tok));
      } else if (
        (tok = RULES.comment.exec(lines[line])) ||
        lines[line] === ""
      ) {
        ++line;
        continue;
      } else {
        console.error(
          "Undefined token at line:",
          line + 1,
          ":",
          '"' + lines[line] + '"',
        );
        process.exit(0);
      }
      line++;
    }

    return final;
  }
}
