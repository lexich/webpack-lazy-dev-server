import fs from "fs";
import path from "path";
import { promisify } from "util";

const writeFileAsync = promisify(fs.writeFile);

const TEMPATE_HOT = (key: string) => `import fn from './$_${key}';
fn();
if (module.hot) {
  module.hot.accept('./$_${key}', () => {
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
  readonly relPath = path.relative(
    this.options.SRC,
    path.join(this.options.packsDirectory, this.name)
  );

  readonly nameJS = `${this.name}.js`;
  readonly url = path.join(this.options.publicPath, this.nameJS);
  readonly path = path.join(this.options.SRC, `$_${this.name}.js`);

  private readonly TEMPLATE_ROOT_REQUIRE =
    this.options.TEMPLATE_ROOT_REQUIRE?.(this.relPath) ??
    TEMPLATE_ROOT_REQUIRE(this.relPath);
  private readonly TEMPATE_HOT =
    this.options.TEMPATE_HOT?.(this.nameJS) ?? TEMPATE_HOT(this.nameJS);
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
    return this.writeFileAsyncNotify(filepath, this.TEMPATE_HOT);
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
