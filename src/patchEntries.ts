import path from 'path';

export default function patchEntries(entry: Record<string, string>, src: string) {
  return Object.keys(entry).reduce((memo, key) => {
    const filepath = path.join(src, key) + '.js';
    memo[key] = filepath;
    return memo;
  }, {} as Record<string, string>);
}
