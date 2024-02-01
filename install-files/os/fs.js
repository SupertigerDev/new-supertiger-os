import Dexie from '../../dexie/dexie.js'
import path from './path.js'

/**
 *
 * @type {Dexie}
 */
let db = new Dexie('hdd');
let initComplete = false;

function init () {
  if (initComplete) return;
  db.version(1).stores({
    metadata: '++path, *name, size, type, createdAt, modifiedAt, directory',
    files: '++path, blob'
  })
  db.version(2).stores({
    metadata: '++path, *name, size, type, createdAt, modifiedAt, directory, app',
  })
  
  // How to add another version
  // 1. close browser tab
  // 2. write a new version above.
  // 3. update os version in config.json
  // 4. open browser tab again.

  initComplete = true;
}



let rootDirCreated = false;

/**
 * Writes data to a file.
 *
 * @param {string} dest - the file path
 * @param {string | Blob} data - the data to be written
 * @return {Promise} a Promise that resolves when the file is written
 */
const writeFile = async (dest, data) => {
  const blob = data instanceof Blob ? data : new Blob([data], {type: "text/plain"});

  const dirname = path.dirname(dest)
  const basename = path.basename(dest)
  const pathStat = await stat(dirname);
  
  if (!pathStat) {
    throw new Error("Directory does not exist! (" + dirname + ")");
  } 

  let app = false;
  if (dest.endsWith(".js")) {
    app = await supertigerAppMetadata(blob)
  }

  await db.table("metadata").put({
    path: dest,
    name: basename,
    size: blob.size,
    type: blob.type,
    app,
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
    const fullPath = path.join(...split.slice(0, i + 1));
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

const readFile = async (path) => {
  const details = await db.table("files").where("path").equals(path).first();
  return details?.blob;
}

const createRootDir = async () => {
  if (rootDirCreated) {
    return;
  }
  rootDirCreated = true;
  await mkdir("/")
}

const readdir = async (dirname) => {

  const dirnameWithTrailing = dirname.endsWith("/") ? dirname : dirname + "/";

  const dirnamePartLength = dirnameWithTrailing.split("/").length;
  return db.table("metadata")
    .where("path")
    .startsWith(dirnameWithTrailing)
    .filter(data => {
      const path = data.path;
      if (path === "/") return false;
      const partLength  = path.split("/").length;
      return partLength === dirnamePartLength
    })
    .keys()
}


// import fs from 'fs/promises';


const START = [47, 47, 83, 84, 95, 65] //ST_A
const END = [47, 47, 69, 78, 68] //END

/**
 * Checks if the input blob is a Supertiger app.
 *
 * @param {Blob} blob - the input blob to be checked
 * @return {{packageName: string, iconPath: string}} true if the input blob is a Supertiger app, false otherwise
 */
const supertigerAppMetadata = async (blob) => {
  const reader = blob.stream().getReader()
  const chunk = await reader.read()
  const start = chunk.value.slice(0, START.length);
  if (!areEqual(start, START)) return false;


  const textDecoder = new TextDecoder();
  const text = textDecoder.decode(chunk.value);
  const endIndex = text.indexOf("//END");
  if (endIndex === -1) return false;

  const data = text.slice(START.length, endIndex).split(/\r?\n|\r|\n/g);
  const formattedData = {};
  for (let i = 0; i < data.length; i++) {
    const [key, ...values] = data[i].replace("//", '').split("=");
    if (!key) continue;
    formattedData[key] = JSON.parse(values.join("="));
  }
  return formattedData;
}


const areEqual = (first, second) => first.length === second.length && first.every((value, index) => value === second[index]);

export default {
  writeFile,
  mkdir,
  readFile,
  createRootDir,
  readdir,
  stat,
  init
}