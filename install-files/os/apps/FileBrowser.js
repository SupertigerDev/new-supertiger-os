import fs from "../../../fs.js";
import path from "../../../path.js";
import { Application } from "../Application.js";
import { Window } from "../Window.js";
import { humanFileSize, styled } from "../utils.js";


function start() {
  const app = new Application();

  app.onReady(async () => {
    const win = new Window("File Browser", {
      width: 800,
      height: 600,
      icon: "folder"
    });

    win.baseElement.insertAdjacentHTML("beforeend", styled(win).css`
      .appContainer {
        flex-direction: column;
      }
      .addressBar {
        display: flex;
        align-items: center;
        gap: 4px;
        background-color: rgba(255,255,255,0.2);
        margin: 10px;
        padding-left: 12px;
        border-radius: 6px;
        height: 38px;
        user-select: none;
        .arrow {
          opacity: 0.6;
          font-size: 14px;
        }
        .part {
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: background-color 0.2s;
          min-width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          &:hover {
            background-color: rgba(255,255,255,0.2);
          }
        }

      }
      .fileList {
        margin-left: 10px;
        margin-right: 10px;
        user-select: none;
        .fileItem {
          display: flex;
          gap: 6px;
          align-items: center;
          padding: 10px;
          border-radius: 6px;
          transition: background-color 0.2s;
          .icon {
            &.folder {
              color: #ffd165;
            }
          }
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
    let files = []

    const addressBar = createAddressBar();
    
    const filesList = createFilesList(win, async (path) => {
      updatePath(currentPath + path + "/")
    });


    const updatePath = async (path) => {
      currentPath = path;
      addressBar.update(currentPath);
      let files = await fs.readdir(currentPath);
      filesList.update(files);
    }
    updatePath("/")
    

    addressBar.onReplaceEventRequest(updatePath)
    


    win.appContainer.appendChild(addressBar.element);
    win.appContainer.appendChild(filesList.element);


    app.openWindow(win);
  });
  return app;
}


const createAddressBar = () => {
  let replacePathEvent;
  const element = document.createElement("div");
  element.classList.add("addressBar");

  element.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLDivElement) {
      const partEl = target.closest(".part");
      if (partEl) {
        const path = partEl.getAttribute("data-full-path");
        if (path) replacePathEvent?.(path);
      }
    }
  })

  const update = (newVal) => {

    element.innerHTML = "";   
    const parts = ("~/" + newVal).split("/").filter(part => part);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const partEl = document.createElement("div");
      partEl.classList.add("part");
      partEl.innerText = part;

      let pathFromHere = parts.slice(0, i + 1).join("/");

      if (pathFromHere === "~") pathFromHere = "/";
      else pathFromHere = pathFromHere.substring(1) + "/";

      partEl.setAttribute("data-full-path", pathFromHere);

      if (i !== 0) element.innerHTML += `<span class="material-icons-round arrow">chevron_right</span>`
      element.appendChild(partEl);
    }
   
  };

  update("/")

  return {
    element,
    update,
    onReplaceEventRequest: (cb) => {
      replacePathEvent = cb;
    }
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

      const icon = document.createElement("span");
      icon.classList.add("material-icons-round");
      icon.classList.add("icon");
      
      itemEl.appendChild(icon);
      
      itemEl.append(basename);
      
      element.appendChild(itemEl);
      
      fs.stat(file).then(res => {
        const isFolder = res.directory;
        icon.classList.add(isFolder ? "folder" : "file");

        icon.innerText = isFolder ? "folder" : "insert_drive_file";
          itemEl.innerHTML += `
          <div class='data'>
            ${res.type?.split("/")[1] || "Folder"} ${isFolder ? "" : `• ${humanFileSize(res.size)}`}
          </div>`;
      })

    }
  }
  
  return {
    element,
    update
  }
}


export { start };
