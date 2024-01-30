import Dexie from './dexie/dexie.js'
import path from './path.js'


const db = new Dexie('hdd');

db.version(1).stores({
  metadata: '++path, *name, size, type, createdAt, modifiedAt, directory',
  files: '++path, blob'
})


let rootDirCreated = false;

/**
 * Writes data to a file.
 *
 * @param {string} dest - the file path
 * @param {string | Blob} data - the data to be written
 * @return {Promise} a Promise that resolves when the file is written
 */
const writeFile = async (dest, data) => {
  await createRootDir()
  const blob = data instanceof Blob ? data : new Blob([data], {type: "text/plain"});

  const dirname = path.dirname(dest)
  const basename = path.basename(dest)
  const pathStat = await stat(dirname);
  
  if (!pathStat) {
    throw new Error("Directory does not exist! (" + dirname + ")");
  } 

  await db.table("metadata").put({
    path: dest,
    name: basename,
    size: blob.size,
    type: blob.type,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    directory: false
  });
  await db.table("files").put({
    blob: blob,
    path: dest
  });
}

const stat = async (dirname) => {
  const details = await db.table("metadata").where("path").equals(dirname).first();
  return details;
}

const mkdir = async (dirname) => {
  const split = dirname.split("/").filter(p => p);
  
  if (dirname === "/") {
    const pathStat = await stat("/");
    if (pathStat) {
      return;
    }
    await db.table("metadata").put({
      path: "/",
      name: "",
      size: 0,
      type: "",
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      directory: true
    })
  }
  
  for (let i = 0; i < split.length; i++) {
    const fullPath = "/" + path.join(...split.slice(0, i + 1));
    const pathStat = await stat(dirname);
    if (pathStat) {
      return;
    }
    await db.table("metadata").put({
      path: fullPath,
      name: "",
      size: 0,
      type: "",
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      directory: true
    })
  }
}

const createRootDir = async () => {
  if (rootDirCreated) {
    return;
  }
  rootDirCreated = true;
  await mkdir("/").catch(() => {});
}
createRootDir();


// import fs from 'fs/promises';
// fs.mkdir()

export default {
  writeFile,
  mkdir
}