import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import { promisify } from "util";

const writeFileAsync = promisify(fs.writeFile);

const TEMPATE_HOT = (key: string) => `import fn from './${key}';
fn();
if (module.hot) {
  module.hot.accept('./${key}', () => {
    fn();
  });
}`;

const TEMPLATE_ROOT = (code: string) =>
  `export default function() { ${code || ""}}`;

const TEMPLATE_ROOT_REQUIRE = (relPath: string) =>
  `export  default function() { const fn = require('${relPath}').defaults; fn && fn();}`;

export interface IEntryOptions {
  SRC: string;
  name: string;
  publicPath: string;
  packsDirectory: string;
  code?: string;
  TEMPLATE_ROOT_REQUIRE?: (v: string) => string;
  TEMPATE_HOT?: (v: string) => string;
  TEMPLATE_ROOT?: (v: string) => string;
  writeFileAsyncNotify?: typeof writeFileAsync;
}

export class Entry {
  public state?: "empty" | "fill";
  readonly name = this.options.name;
  readonly nameJS = `${this.name}.js`;
  readonly relPath = path.relative(
    path.dirname(path.join(this.options.SRC, this.nameJS)),
    path.join(this.options.packsDirectory, this.nameJS)
  );

  readonly nameJS_HOT = `${this.name}_$.js`;
  readonly url = path.join(this.options.publicPath, this.nameJS);
  readonly path = path.join(this.options.SRC, this.nameJS_HOT);

  private readonly TEMPLATE_ROOT_REQUIRE =
    this.options.TEMPLATE_ROOT_REQUIRE?.(this.relPath) ??
    TEMPLATE_ROOT_REQUIRE(this.relPath);
  private readonly TEMPATE_HOT =
    this.options.TEMPATE_HOT?.(path.basename(this.nameJS_HOT)) ?? TEMPATE_HOT(path.basename(this.nameJS_HOT));
  private readonly TEMPLATE_ROOT =
    this.options.TEMPLATE_ROOT?.(this.options.code ?? "") ??
    TEMPLATE_ROOT(this.options.code ?? "");

  public writeFileAsyncNotify =
    this.options.writeFileAsyncNotify ?? writeFileAsync;

  constructor(private options: IEntryOptions) {
    if (/\.js$/.test(options.name)) {
      throw new Error(`Invalid entry name: ${options.name}`);
    }
  }

  test(url: string): boolean {
    return this.name === url || this.url === url || this.nameJS === url;
  }

  createHot(): Promise<void> {
    const filepath = path.join(this.options.SRC, this.nameJS);
    const hotFolder = path.dirname(filepath);
    return mkdirp(hotFolder).then(() =>
      this.writeFileAsyncNotify(filepath, this.TEMPATE_HOT)
    );
  }

  create(state: "empty" | "fill"): Promise<void> {
    this.state = state;
    const content =
      state === "fill" ? this.TEMPLATE_ROOT_REQUIRE : this.TEMPLATE_ROOT;
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.writeFileAsyncNotify(this.path, content);
        resolve();
      }, 10);
    });
  }
}
