import path from 'path';

export default function patchEntries(entry: Record<string, string>, src: string) {
  return Object.keys(entry).reduce((memo, key) => {
    const filename = entry[key];
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    const filepath = path.join(src, name) + '.js';
    memo[name] = filepath;
    return memo;
  }, {} as Record<string, string>);
}
