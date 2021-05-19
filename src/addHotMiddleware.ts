export default function addHotMiddleware(
  entry: Record<string, string>,
  host: string,
  options?: Record<string, string>
) {
  const opts = Object.assign({ noInfo: true }, options ?? {});
  return Object.keys(entry).reduce((memo, key) => {
    const params = Object.keys(Object.assign({}, opts, { name: key }))
      .map((key) => `${key}=${opts[key]}`)
      .join("&");
    memo[key] = [
      entry[key],
      `webpack-hot-middleware/client?path=${host}/__webpack_hmr&${params}`,
    ];
    return memo;
  }, {} as Record<string, string[]>);
}
