module.exports = (fn, ctx) =>
  function () {
    const args = Array.from(arguments);
    return new Promise((resolve, reject) => {
      args.push((err, data) => (err ? reject(err) : resolve(data)));
      fn.apply(ctx || null, args);
    });
  };
