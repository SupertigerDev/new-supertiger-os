import installMap from "./install-map.json" assert { type: "json" };

import fs from './fs.js';
await fs.createRootDir();

import path from "./path.js";


const installed = localStorage["installed"];

const ready = () => {
  localStorage["installed"] = true;
  const style = document.createElement('link');
  style.href = "./hdd/os/styles.css";
  style.rel = "stylesheet";
  document.head.appendChild(style);

  const script = document.createElement('script');
  script.src = "./hdd/os/OS.js";
  script.type = "module";
  document.head.appendChild(script); 

}

const main = async () => {

  // await hdd.clear()

  for (let i = 0; i < installMap.length; i++) {
    const dir = installMap[i];
    const res = await fetch("./install-files/" + dir.path).then(res => res.blob());
    const dirname = path.dirname("/" + dir.path);
    await fs.mkdir(dirname);
    await fs.writeFile("/" + dir.path, res)
  }
  ready();
}

// if (installed) {
//   console.log("Already installed");
//   ready();
// } else {
//   main();
// }
main();

