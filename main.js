/*
    WELCOME TO DOMLSON CONFIGURATION LANGUAGE
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
      result["type"] = "array";
    } else {
      let resultVal = this.typeCheck(variableValue);
      result[variableName] = resultVal;
      result["type"] = typeof resultVal;
    }

    return result;
  }
  async main(src) {
    let tok;
    let lines;
    let final = [];
    let content = src;

    if (RULES.source.test(src)) {
      content = await this.getSource(src);
      content = content.split("\r\n");

      if (!content) return;
    }

    content != src ? (lines = content) : (lines = content.trim().split("\n"));

    for (let el of lines) {
      if ((tok = RULES.definition.exec(el))) {
        final.push(this.createTree(tok));
      } else if((tok = RULES.comment.exec(el))) {
        continue;
      }
    }
    // console.log("Final Config:", final);
    return final;
  }
}

