import path from "path";
import fs from "fs";
import { promisify } from "util";

const statAsync = promisify(fs.stat);
const readdirAsync = promisify(fs.readdir);

export default function loadEntries(
  dir: string,
  rootDirs: string[] = [],
  acceptFile?: (path: string) => boolean
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  return readdirAsync(dir)
    .then((files) => {
      const defer: Promise<void>[] = files.map((file) => {
        const filePath = path.join(dir, file);
        return statAsync(filePath)
          .then((stat) => {
            if (stat.isDirectory()) {
              return loadEntries(filePath, rootDirs.concat(file), acceptFile).then((res) => {
                Object.assign(result, res);
                return;
              });
            } else if (stat.isFile()) {
              const isEntry = acceptFile ? acceptFile(filePath) : true;
              if (isEntry) {
                const ext = path.extname(filePath);
                const name = path.basename(filePath, ext);
                const fullName = path.join(...rootDirs.concat(name));
                result[fullName] = filePath;
              }
              return;
            }
          })
          .catch(() => {
            return;
          });
      });
      return Promise.all(defer).then(() => result);
    })
    .catch(() => result);
}
