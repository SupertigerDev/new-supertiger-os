
import config from './config.js';
import fs from './install-files/os/fs.js';
import path from "./install-files/os/path.js";

fs.init();


const ready = () => {
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
  const {render} = await import('./install-files/os/solid-js/web/index.js')
  const html = (await import('./install-files/os/solid-js/html/index.js')).default
  const {Show, onMount} = await import('./install-files/os/solid-js/index.js');
  const {createStore} = await import('./install-files/os/solid-js/store/index.js')

  const [details, setDetails] = createStore({
    installMapLoaded: false,
    currentPath: null
  });
  const App = () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let installMap;

    const installed = localStorage["installed"];
    const version = localStorage["version"];
    const updating = installed && version !== config.version

    onMount(async () => {
      await fs.createRootDir();
      installMap = await fetch("./install-map.json").then(res => res.json());
      
      setTimeout(async () => {
        setDetails("installMapLoaded", true);
        
        for (let i = 0; i < installMap.length; i++) {
          const dir = installMap[i];
          setDetails({
            currentPath: "/" + dir.path,
            currentItemIndex: i + 1
          });
          const res = await fetch("./install-files/" + dir.path).then(res => res.blob());
          const dirname = path.dirname("/" + dir.path);
          await fs.mkdir(dirname);
          await fs.writeFile("/" + dir.path, res)
          await sleep(100);
        }
        localStorage["installed"] = true;
        localStorage["version"] = config.version;
        
        setTimeout(() => {
          location.reload()
        }, 2000);
        
      }, 1000);

    })

    

    const InstallScreen = () => {
      const style = {
        position: 'absolute',
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        inset: "0",
        background: "black",
        color: "white",
        "font-family": "Arial, Helvetica, sans-serif"
      }
  
      const topTitleStyle = {
        position: 'absolute',
        top: "20px",
        left: "20px",
        "font-size": "18px",
      }
      const centerContainerStyle = {
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        
      }
  
      const progressBarStyle = {
        height: "34px",
        width: "90vw",
        "max-width": "700px",
        "border-radius": "6px",
        border: "solid 2px white"
      }
  

      const percentage = () => {
        return details.currentItemIndex / installMap.length * 100;
      }

      const fillBarStyle = () => ({
        height: "100%",
        background: "white",
        width: percentage() + "%",
      })
  
  
  
      return html`
      <div style=${style}>
        <div style=${topTitleStyle}>${updating ? "Updating" : "Installing"} Supertiger OS ${config.version}</div>
  
        <div style=${centerContainerStyle}>
          <div style="margin-bottom: 20px; font-size: 18px; text-align: center;">${updating ? `Setup is updating Supertiger OS...` : `Setup is installing Supertiger OS to indexedDB.`}</div>
          <div style=${progressBarStyle}><div style=${fillBarStyle} /></div>
          <div style="margin-top: 8px; margin-left: auto;">Copying ${() => details.currentPath}</div>
        </div>
  
      </div>
      `
    }

    const InfoScreen = (props) => {
      const style = {
        position: 'absolute',
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        inset: "0",
        background: "black",
        color: "white",
        "font-family": "Arial, Helvetica, sans-serif"
      }
  
      const topTitleStyle = {
        position: 'absolute',
        top: "20px",
        left: "20px",
        "font-size": "18px",
      }
      const centerContainerStyle = {
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        
      }  
  
      return html`
      <div style=${style}>
        <div style=${topTitleStyle}>${updating ? "Updating" : "Installing"} Supertiger OS ${config.version}</div>
  
        <div style=${centerContainerStyle}>
          <div style="margin-bottom: 20px; font-size: 18px;">${props.message}</div>
        </div>
  
      </div>
      `
    }

   


    return html`
      <${Show} when=${() => !details.installMapLoaded}>
        <${InfoScreen} message="Waiting for setup to initialize..." />
      <//>

      <${Show} when=${() => details.installMapLoaded}>
        <${InstallScreen} />
      <//>
    
    `
  }


  const destroy = render(App, document.getElementById("root"));

}

const installed = localStorage["installed"];
const version = localStorage["version"];

if (installed && version === config.version) {
  console.log("Already installed");
  ready();
} else {
  main();
}
// main();

