import path from "path";
import express from "express";
import webpack from "webpack";
import EntryList from "./EntryList";
import configureApp from "./configureApp";

export { webpack };

export interface ICreateServer {
  packsDirectory: string;
  host: string;
  config: webpack.Configuration;
  srcVirtual?: string;
  code?: string;
  acceptFile?: (val: string) => boolean;
  configure?: (entryList: EntryList) => void;
  hotMiddlewareOptions?: Record<string, string>;
}

export async function createServer({
  packsDirectory,
  host,
  code,
  srcVirtual,
  configure,
  ...options
}: ICreateServer) {
  // new virtual directory for entries
  const SRC =
    srcVirtual ||
    path.join(
      process.cwd(),
      "node_modules",
      ".cache",
      "webpack-lazy-dev-server"
    );
  const {
    instance: entryList,
    compiler,
    config,
  } = await EntryList.build({
    SRC,
    packsDirectory,
    code,
    host,
    ...options,
  });
  configure?.(entryList);
  return configureApp(express(), {
    config,
    entryList,
    compiler,
  });
}
