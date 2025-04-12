#!/usr/bin/env node
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
import chalk from "chalk";
import figlet from "figlet";
import { Command } from "commander";
console.log(chalk.magentaBright(figlet.textSync("NPM ALTERNATIVE")));
var program = new Command();
program.name("nalt").description("Suggest better npm package alternatives").version("1.0.0");
program.command("find <pkg>").description("Find better alternative").option("-j, --json", "Output in JSON").action((pkg, options) => __async(void 0, null, function* () {
  yield findAlternative(pkg, options);
}));
function findAlternative(pkg, options) {
  return __async(this, null, function* () {
    try {
      if (!pkg || pkg.trim() === "") {
        console.error(chalk.red("Package name is required"));
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
        console.log(chalk.yellow(`No alternatives found for "${pkg}"`));
        return;
      }
      const results = data.filter((d) => d.package.name.toLowerCase() !== pkg.toLowerCase()).sort((a, b) => b.score.final - a.score.final).slice(0, 3);
      if (results.length === 0) {
        console.log(chalk.yellow(`No suitable alternatives found for "${pkg}"`));
        return;
      }
      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        console.log(chalk.magentaBright(`Top 3 Alternatives for "${pkg}":
`));
        results.forEach((d, index) => {
          console.log(chalk.cyan(`#${index + 1} Package: ${d.package.name}`));
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
        chalk.red("Error:", error instanceof Error ? error.message : error)
      );
      process.exit(1);
    }
  });
}
program.parse(process.argv);
