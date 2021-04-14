const fs = require('fs');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const path = require('path');

const promisify = require('./promisify');

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

async function prepareEnv({SRC, entryMap, code, ...options }) {
  // clear virtual folder
  await rimrafAsync(SRC);
  // create virtual folder
  await mkdirp(SRC);

  // create virtual entries
  const deferEntries = Object.keys(entryMap).map(key => {
    const filepath = path.join(SRC, key) + '.js';
    const filepathLoad = path.join(SRC, '$_' + key) + '.js';
    return Promise.all([
      writeFileAsync(filepath, (options.TEMPATE_HOT || TEMPATE_HOT)(key)),
      writeFileAsync(filepathLoad, (options.TEMPLATE_ROOT || TEMPLATE_ROOT)(code)),
    ]);
  });
  await Promise.all(deferEntries);
}
module.exports = prepareEnv;
