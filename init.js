import installMap from "./install-map.json" assert { type: "json" };



import {getFileStorage} from './idb-file-storage.js';

const installed = localStorage["installed"];



const ready = () => {
  localStorage["installed"] = true;
  const style = document.createElement('link');
  style.href = "./hdd/styles.css";
  style.rel = "stylesheet";
  document.head.appendChild(style);

  const script = document.createElement('script');
  script.src = "./hdd/os/OS.js";
  script.type = "module";
  document.head.appendChild(script); 

}

const main = async () => {

  const hdd = await getFileStorage({name: "hdd"});
  // await hdd.clear()

  for (let i = 0; i < installMap.length; i++) {
    const dir = installMap[i];
    const res = await fetch("/install-files/" + dir.path).then(res => res.blob());
    await hdd.put(dir.path, res)
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

