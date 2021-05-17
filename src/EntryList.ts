import mkdirp from "mkdirp";
import rimraf from "rimraf";
import webpack, { Compiler, Configuration } from "webpack";
import set from "lodash/set";

import { promisify } from "util";
import loadEntries from "./loadEntries";
import patchEntries from "./patchEntries";
import addHotMiddleware from "./addHotMiddleware";
import { Entry } from "./Entry";

const rimrafAsync = promisify(rimraf);

export interface IEntryListOptions {
  SRC: string;
  packsDirectory: string;
  code?: string;
  host: string;
  config: webpack.Configuration;
  acceptFile?: (val: string) => boolean;
}

export default class EntryList {
  readonly entries: Entry[] = [];
  private _publicPath: string | undefined;
  get publicPath() {
    return this._publicPath ?? "/";
  }

  private constructor(private options: IEntryListOptions) {}

  static async build(options: IEntryListOptions) {
    const instance = new EntryList(options);
    const entriesConfig = await loadEntries(
      options.packsDirectory,
      options.acceptFile
    );
    const { compiler, config } = await instance.setup({ entriesConfig });
    return { compiler, config, instance };
  }

  create(url: string, mode: "fill" | "empty") {
    const entry = this.entries.find((entry) => entry.test(url));
    if (!entry) {
      return Promise.reject(new Error(`Can't find entry`));
    }
    return entry.create(mode);
  }

  private async setup(opt: { entriesConfig: Record<string, string> }): Promise<{
    compiler: Compiler;
    config: Configuration;
  }> {
    const entryMap = patchEntries(opt.entriesConfig, this.options.SRC);
    const { SRC, packsDirectory, code, host } = this.options;

    const config = {
      ...this.options.config,
      entry: addHotMiddleware(entryMap, host),
      plugins: (this.options.config.plugins || []).concat([
        new webpack.HotModuleReplacementPlugin(),
      ]),
    };
    const publicPath = this.options.config?.output?.publicPath as
      | string
      | undefined;
    this._publicPath = publicPath;
    if (publicPath) {
      set(config, "output.publicPath", host + publicPath);
    }

    Object.keys(entryMap).forEach((key) => {
      const entry = new Entry({
        SRC,
        name: key,
        publicPath: this.publicPath,
        packsDirectory,
        code,
      });
      this.entries.push(entry);
    });

    await this.clearFolder();
    await this.createFolder();

    const deferEntries = this.entries.reduce((memo, entry) => {
      memo.push(entry.create("empty"));
      memo.push(entry.createHot());
      return memo;
    }, [] as Promise<void>[]);
    await Promise.all(deferEntries);

    const compiler = webpack(config);
    const iFS: any = compiler.inputFileSystem;

    const writeFileAsyncNotify: any = (...args: any[]) =>
      new Promise((resolve, reject) =>
        iFS.fileSystem.writeFile(...args, (err?: any, data?: any) =>
          err ? reject(err) : resolve(data)
        )
      );
    this.entries.forEach(
      (entry) => (entry.writeFileAsyncNotify = writeFileAsyncNotify)
    );
    return { compiler, config };
  }

  private clearFolder() {
    // clear virtual folder
    return rimrafAsync(this.options.SRC);
  }

  private createFolder() {
    // create virtual folder
    return mkdirp(this.options.SRC);
  }
}
