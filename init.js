
import fs from './fs.js';
import path from "./path.js";




const ready = () => {
  localStorage["installed"] = true;
  const styleicons = document.createElement('link');
  styleicons.href = "./hdd/os/assets/material-icons/material-icons.css";
  styleicons.rel = "stylesheet";
  document.head.appendChild(styleicons);


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
  await fs.createRootDir();
  const installMap = await fetch("./install-map.json").then(res => res.json());

  for (let i = 0; i < installMap.length; i++) {
    const dir = installMap[i];
    const res = await fetch("./install-files/" + dir.path).then(res => res.blob());
    const dirname = path.dirname("/" + dir.path);
    await fs.mkdir(dirname);
    await fs.writeFile("/" + dir.path, res)
  }
  ready();
}

const installed = localStorage["installed"];
// if (installed) {
//   console.log("Already installed");
//   ready();
// } else {
//   main();
// }
main();

