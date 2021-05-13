const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

const promisify = require('./promisify');

const statAsync = promisify(fs.stat);
const writeFileAsync = promisify(fs.writeFile);
const rimrafAsync = promisify(rimraf);

const TEMPATE_HOT = key => `import fn from './$_${key}';
fn();
if (module.hot) {
  module.hot.accept('./$_${key}', () => {
    fn();
  });
}`

const TEMPLATE_ROOT = code => `export default function() { ${code || ''}}`

const TEMPLATE_ROOT_REQUIRE = relPath => `export default function() { const fn = require('${relPath}').defaults; fn && fn();}`

/** @typedef VirtualEntryOptions  */

class VirtualEntry {
  /**
   * @param {VirtualEntryOptions=} options
   */
  constructor(options) {
    this.info = options.info;
    this.code = options.code;
    this.SRC = options.SRC;
    this.packsDirectory = options.packsDirectory;
    this.entryMap = options.entryMap;

    this.writeFileAsyncNotify = writeFileAsync;
    this.TEMPLATE_ROOT_REQUIRE = options.TEMPLATE_ROOT_REQUIRE || TEMPLATE_ROOT_REQUIRE;
    this.TEMPATE_HOT = options.TEMPATE_HOT || TEMPATE_HOT;
    this.TEMPLATE_ROOT = options.TEMPLATE_ROOT || TEMPLATE_ROOT;
  }

  setWriteFileAsyncNotify(fn) {
    this.writeFileAsyncNotify = fn;
  }

  virtualFilepath(url) {
    return path.join(this.SRC, '$_' + url);
  }

  allow(url, checked) {
    if (url && /\.js$/.test(url)) {
      const virtualFilepath = this.virtualFilepath(url);
      return statAsync(virtualFilepath).then(() => this.info[url] === !checked);
    }
    return Promise.resolve(false);
  }

  writeVirtualEntry(url, isLoadComponent) {
    const virtualFilepath = this.virtualFilepath(url);
    const packPath = path.join(this.packsDirectory, url);
    this.info[url] = isLoadComponent;
    const relPath = path.relative(this.SRC, packPath).replace(/\.js$/, '');
    const content = isLoadComponent ? TEMPLATE_ROOT_REQUIRE(relPath) : this.TEMPLATE_ROOT(this.code);
    return new Promise(resolve => {
      setTimeout(() => {
        this.writeFileAsyncNotify(virtualFilepath, content)
        resolve();
      }, 10);
    });
  }

  set(url, isLoadComponent) {
    return this.allow(url, isLoadComponent)
      .then(allow => {
        if (allow) {
          return this.writeVirtualEntry(url, isLoadComponent);
        }
    });
  }

  clearFolder() {
    // clear virtual folder
    return rimrafAsync(this.SRC);
  }

  createFolder() {
    // create virtual folder
    return mkdirp(this.SRC);
  }

  prepareFolder() {
    return this.clearFolder().then(() => this.createFolder());
  }

  prepareEntries() {
    // create virtual entries
    const deferEntries = Object.keys(this.entryMap).map(key => {
      const filepath = path.join(this.SRC, key) + '.js';
      return Promise.all([
        writeFileAsync(filepath, this.TEMPATE_HOT(key)),
        this.writeVirtualEntry(key + '.js', false),
      ]);
    });
    return Promise.all(deferEntries);
  }

  prepareEnv() {
    return this.prepareFolder()
      .then(() => this.prepareEntries());
  }
}

module.exports = VirtualEntry;
