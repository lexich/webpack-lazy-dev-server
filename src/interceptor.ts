import path from "path";
import express from "express";
import EntryList from "./EntryList";

export interface IMiddlewareOptions {
  entryList: EntryList;
}

export default function interceptor({ entryList }: IMiddlewareOptions) {
  const fn: express.RequestHandler = (req, res, next) => {
    const url = req.url
      ? path.relative(entryList.publicPath, req.url)
      : req.url;
    entryList.create(url, "fill").then(
      () => next(),
      () => next()
    );
  };
  return fn;
}
