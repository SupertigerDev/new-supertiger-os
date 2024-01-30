import fs from "../../../fs.js";
import path from "../../../path.js";
import { Application } from "../Application.js";
import { Window } from "../Window.js";
import { humanFileSize, styled } from "../utils.js";


function start() {
  const app = new Application();

  fs.readdir("/").then(console.log)

  app.onReady(async () => {
    const win = new Window("File Browser", {
      width: 800,
      height: 600
    });

    win.baseElement.insertAdjacentHTML("beforeend", styled(win).css`
      .appContainer {
        flex-direction: column;
        background-color: rgba(0,0,0,0.66);
        backdrop-filter: blur(86px);
      }
      .addressBar {
        background-color: rgba(255,255,255,0.2);
        margin: 10px;
        padding: 10px;
        border-radius: 6px;
      }
      .fileList {
        margin-left: 10px;
        margin-right: 10px;
        user-select: none;
        .fileItem {
          display: flex;
          align-items: center;
          padding: 10px;
          border-radius: 6px;
          transition: background-color 0.2s;
          &:hover {
            background-color: rgba(255,255,255,0.2);
          }
          .data {
            margin-left: auto;
            opacity: 0.6;
            font-size: 14px;  
          }
        }
      }
    `);

    let currentPath = "/";
    let files = await fs.readdir(currentPath);

    const addressBar = createAddressBar();
    
    const filesList = createFilesList(win, async (path) => {
      currentPath += path + "/";
      addressBar.update(currentPath);
      let files = await fs.readdir(currentPath);
      filesList.update(files);
    });
    filesList.update(files);
    
    win.appContainer.appendChild(addressBar.element);
    win.appContainer.appendChild(filesList.element);


    app.openWindow(win);
  });
  return app;
}


const createAddressBar = () => {
  const element = document.createElement("div");
  element.classList.add("addressBar");
  const update = (newVal) => {
    element.innerHTML = newVal;
  };

  element.innerHTML = `/`;

  return {
    element,
    update
  }

}



const createFilesList = (win, appendDir) => {
  const element = document.createElement("div");
  element.classList.add("fileList");

  element.addEventListener("dblclick", (e) => {
    const target = e.target;
    if (target instanceof HTMLDivElement) {
      const closestTo = target.closest(".fileItem");
      const path = closestTo.getAttribute("data-path");
      appendDir(path);
      return;
    }
  })

  const update = async (files) => {
    element.innerHTML = "";
    for (const file of files) {
      const itemEl = document.createElement("div");
      const basename = path.basename(file);
      itemEl.classList.add("fileItem");
      itemEl.setAttribute("data-path", basename);
      itemEl.innerText = basename;
      element.appendChild(itemEl);

      fs.stat(file).then(res => {
          itemEl.innerHTML += `<div class='data'>${res.type?.split("/")[1] || "Folder"} • ${humanFileSize(res.size)}</div>`;
      })

    }
  }
  
  return {
    element,
    update
  }
}


export { start };
