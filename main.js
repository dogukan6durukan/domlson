/*
  WELCOME TO DOMLSON CONFIGURATION LANGUAGE

  [
    {...},
    {
      object_name : "..."
      name : "...",
      ...
    },
    ...
  ]

  Bug notes:
  name : "John Cena",
  don't understand "," as a bug

*/

import fs from "fs/promises";
import { RULES } from "./rules.js";

export default class Domlson {
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
    if (!isNaN(val)) {
      val = Number(val);
    } else if (val.startsWith('"') && val.endsWith('"')) {
      val = val.replaceAll('"', "");
    } else if (val === "true" || val === "false") {
      val = val === "true";
    } else {
      console.error("Unexpected type:", val);
      return null;
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
        while(lines[line] !== "") {
          line++;
          if ((tok = RULES.definition.exec(lines[line]))) {
            myObject = {...myObject, ...this.createTree(tok)};
          }
        } 
        final.push(myObject);
      } else if(( tok = RULES.definition.exec(lines[line]) )) {
        final.push(this.createTree(tok));
      } else if(( tok = RULES.comment.exec(lines[line]) )){
        continue;
      } else {
        if(lines[line] === "") {
          break;
        }
        console.error("Undefined token at line:", line + 1, ":", '"'+lines[line]+'"');       
      }

      line++;
    }

    return final;
  }
}
