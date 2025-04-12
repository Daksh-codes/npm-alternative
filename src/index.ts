#!/usr/bin/env node

import chalk from "chalk";
import figlet from "figlet";
import { Command } from "commander";

interface FindOptions {
  json?: boolean;
}

console.log(chalk.magentaBright(figlet.textSync("NPM ALTERNATIVE")));

const program = new Command();

program
  .name("nalt")
  .description("Suggest better npm package alternatives")
  .version("1.0.0");

program
  .command("find <pkg>")
  .description("Find better alternative")
  .option("-j, --json", "Output in JSON")
  .action(async (pkg: string, options: FindOptions) => {
    await findAlternative(pkg, options);
  });

interface NpmPackage {
  package: {
    name: string;
    version: string;
    description?: string;
    links?: {
      npm?: string;
      homepage?: string;
      repository?: string;
    };
  };
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
  searchScore: number;
}

async function findAlternative(pkg: string, options: FindOptions) {
  try {
    if (!pkg || pkg.trim() === "") {
      console.error(chalk.red("Package name is required"));
      process.exit(1);
    }

    // Use the search endpoint with a query excluding the exact package
    const uri = `https://api.npms.io/v2/search?q=${encodeURIComponent(pkg)}`;
    const res = await fetch(uri);

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    // The search endpoint returns { results: NpmPackage[] }
    const response: { results: NpmPackage[] } = await res.json();

    // Extract results
    let data = response.results;

    if (!data || data.length === 0) {
      console.log(chalk.yellow(`No alternatives found for "${pkg}"`));
      return;
    }

    // Filter out exact matches, sort by score.final, and take top 3
    const results = data
      .filter((d) => d.package.name.toLowerCase() !== pkg.toLowerCase())
      .sort((a, b) => b.score.final - a.score.final)
      .slice(0, 3);

    if (results.length === 0) {
      console.log(chalk.yellow(`No suitable alternatives found for "${pkg}"`));
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(chalk.magentaBright(`Top 3 Alternatives for "${pkg}":\n`));
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
              d.package.links.repository,
            ]
              .filter(Boolean)
              .join(", ")}`
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
}

program.parse(process.argv);
