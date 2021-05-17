export default function addHotMiddleware(
  entry: Record<string, string>,
  host: string
) {
  return Object.keys(entry).reduce((memo, key) => {
    memo[key] = [
      entry[key],
      `webpack-hot-middleware/client?path=${host}/__webpack_hmr&name=${key}`,
    ];
    return memo;
  }, {} as Record<string, string[]>);
}
