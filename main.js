/*

    WELCOME TO DOMLSON CONFIGURATION LANGUAGE

    Features wish to add : Variables, Reference, Nested Objects

*/

import fs from "fs/promises";
import { RULES } from "./rules.js";

class Domlson {
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

  createTree(tok) {
    let variableName = tok[1];
    let variableValue = tok[2];

    let num = parseInt(variableValue);
    let string = /"[a-zA-z]+"/;

    let result = {};
    // Detect variable type
    if (!isNaN(num)) {
      result[variableName] = num;
      result["type"] = "Number";
    } else if (string.test(variableValue)) {
      let variableVal = variableValue.replaceAll('"', "");
      result[variableName] = variableVal;
      result["type"] = "String";
    } else if (variableValue === "true" || variableValue === "false") {
      result[variableName] = variableValue === "true";
      result["type"] = "Boolean";
    } else {
      console.error("Unexpected type:", variableValue);
      return 0;
    }

    /* Don't forget variable types */

    return result;
  }

  async main(src) {
    let tok;
    let lines;
    let final = [];
    let content = src;

    if (RULES.source.test(src)) {
      content = await this.getSource(src);
      content =  content.split("\r\n")

      if (!content) return;
    }

    content != src ? lines = content : content.trim().split("\n") ;

    for (let el of lines) {
      if ((tok = RULES.definition.exec(el))) {
        final.push(this.createTree(tok));
      }
    }

    console.log("Final Config:", final);
  }
}

const src = `
    isim : "Dogukan"
    age : 33
    student : false   
`;

const domlson = new Domlson();
domlson.main("abc.dms");
