#!/usr/bin/env node

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { createServer } from "./";
import path from "path";
import boxen from "boxen";
import colors from "colors/safe";
import EntryList from "./EntryList";

const res = yargs(hideBin(process.argv))
  .option("packsDirectory", {
    alias: "d",
    type: "string",
    demandOption: true,
    description: "Directory",
  })
  .strict()
  .option("port", {
    alias: "p",
    type: "number",
    default: 4000,
    description: "Port",
  })
  .option("config", {
    alias: "c",
    type: "string",
    default: "webpack.config.js",
    description: "Webpack config",
  })
  .help().argv as Record<string, string>;

let entryList: EntryList;
createServer({
  packsDirectory: res.packsDirectory,
  host: `http://localhost:${res.port}`,
  config: require(path.join(process.cwd(), res.config)),
  configure: list => {
    entryList = list;
  }
}).then((app) =>
  app.listen(res.port, () => {
    const msgs: string[] = [];
    const link = `http://localhost:${res.port}`;
    msgs.push(`Server:      ${colors.green(link)}`);
    msgs.push(`Admin panel: ${colors.green(link + "/admin")}`);
    msgs.push(`\nAvailable entries:\n`)
    entryList.entries.forEach(entry => {
      msgs.push('- ' + colors.green(link + entry.url))
    });
    const message = boxen(msgs.join("\n"), {padding: 1});
    console.log(message);
  })
);
