#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var import_chalk = __toESM(require("chalk"), 1);
var import_figlet = __toESM(require("figlet"), 1);
var import_commander = require("commander");
console.log(import_chalk.default.magentaBright(import_figlet.default.textSync("NPM ALTERNATIVE")));
var program = new import_commander.Command();
program.name("nalt").description("Suggest better npm package alternatives").version("1.0.0");
program.command("find <pkg>").description("Find better alternative").option("-j, --json", "Output in JSON").action((pkg, options) => __async(void 0, null, function* () {
  yield findAlternative(pkg, options);
}));
function findAlternative(pkg, options) {
  return __async(this, null, function* () {
    try {
      if (!pkg || pkg.trim() === "") {
        console.error(import_chalk.default.red("Package name is required"));
        process.exit(1);
      }
      const uri = `https://api.npms.io/v2/search?q=${encodeURIComponent(pkg)}`;
      const res = yield fetch(uri);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const response = yield res.json();
      let data = response.results;
      if (!data || data.length === 0) {
        console.log(import_chalk.default.yellow(`No alternatives found for "${pkg}"`));
        return;
      }
      const results = data.filter((d) => d.package.name.toLowerCase() !== pkg.toLowerCase()).sort((a, b) => b.score.final - a.score.final).slice(0, 3);
      if (results.length === 0) {
        console.log(import_chalk.default.yellow(`No suitable alternatives found for "${pkg}"`));
        return;
      }
      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        console.log(import_chalk.default.magentaBright(`Top 3 Alternatives for "${pkg}":
`));
        results.forEach((d, index) => {
          console.log(import_chalk.default.cyan(`#${index + 1} Package: ${d.package.name}`));
          console.log(`Version: ${d.package.version}`);
          console.log(`Score: ${d.score.final.toFixed(2)}`);
          console.log(
            `Quality: ${d.score.detail.quality.toFixed(
              2
            )}, Popularity: ${d.score.detail.popularity.toFixed(
              2
            )}, Maintenance: ${d.score.detail.maintenance.toFixed(2)}`
          );
          console.log(
            `Description: ${d.package.description || "No description available"}`
          );
          if (d.package.links) {
            console.log(
              `Links: ${[
                d.package.links.npm,
                d.package.links.homepage,
                d.package.links.repository
              ].filter(Boolean).join(", ")}`
            );
          }
          console.log("---");
        });
      }
    } catch (error) {
      console.error(
        import_chalk.default.red("Error:", error instanceof Error ? error.message : error)
      );
      process.exit(1);
    }
  });
}
program.parse(process.argv);
