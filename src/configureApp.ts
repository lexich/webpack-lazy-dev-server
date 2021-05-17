import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import cors from "cors";
import express from "express";
import interceptor from "./interceptor";
import type { Configuration, Compiler } from "webpack";
import EntryList from "./EntryList";

export interface IConfigureAdmin {
  entryList: EntryList;
}

function configureAdmin(
  app: express.Application,
  { entryList }: IConfigureAdmin
) {
  app.post("/entry", (req, res, next) => {
    if (!req.body) {
      return next(new Error("Invalid request"));
    }
    const entry = req.body.entry;
    if (!entry) {
      return next(new Error("Invalid request"));
    }
    entryList.create(entry, req.body.checked ? "fill" : "empty").then(
      () => {
        res.json({ ok: true }).end();
      },
      () => {
        res.json({ ok: false }).end();
      }
    );
  });

  app.get("/admin", (req, res) => {
    const body = entryList.entries.map((entry) => {
      return `<li><label><input type='checkbox' ${
        entry.state === "fill" ? "checked" : ""
      } data-entry="${entry.name}" onchange="send(this)" /><a href="${entry.url}">${
        entry.name
      }</a></label></li>`;
    });

    res.send(`<html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
    <ul>${body.join("")}</ul>
    <script>
    function send(e) {
      var entry = e.dataset.entry;
      fetch('/entry', {
        method: 'POST',
        body: JSON.stringify({ entry: entry + '.js', checked: e.checked }),
        headers: { 'Content-Type': 'application/json' }
      }).then(d => d.json());
    }
    </script>
    </body>
    </html>`);
  });
}

export interface IConfigureApp {
  config: Configuration;
  compiler: Compiler;
  entryList: EntryList;
}

export default function configureApp(
  app: express.Application,
  { config, compiler, entryList }: IConfigureApp
) {
  app.use(cors());
  app.use(express.json());
  configureAdmin(app, { entryList });

  app.use(interceptor({ entryList }));
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: (config.output?.publicPath ?? "/") as string,
    })
  );
  app.use(webpackHotMiddleware(compiler));
  return app;
}
