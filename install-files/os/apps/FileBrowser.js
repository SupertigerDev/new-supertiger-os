import fs from "../../../fs.js";
import path from "../../../path.js";
import { Application } from "../Application.js";
import { Window } from "../Window.js";
import { humanFileSize, styled } from "../utils.js";

import {onCleanup, For, createSignal, Show, createEffect, onMount} from '../solid-js/index.js'
import {render} from '../solid-js/web/index.js'

import html from '../solid-js/html/index.js'

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
        overflow: hidden;
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
          animation: slidePartUp 0.2s;
          animation-fill-mode: forwards;
          &.lastPart {
            cursor: initial;
            &:hover {
              background-color: initial;
            }
          }
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
          &.folder .icon {
            color: #ffd165;
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

      @keyframes slidePartUp {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }

    `);

    // let currentPath = "/";
    // let files = []

    // const addressBar = createAddressBar();
    
    // const filesList = createFilesList(win, async (path) => {
    //   updatePath(currentPath + path + "/")
    // });


    // const updatePath = async (path) => {
    //   currentPath = path;
    //   addressBar.update(currentPath);
    //   files = await fs.readdir(currentPath);
    //   filesList.update(files);
    // }
    // updatePath("/")
    

    // addressBar.onReplaceEventRequest(updatePath)
    


    // win.appContainer.appendChild(addressBar.element);
    // win.appContainer.appendChild(filesList.element);


    const App = () => {
      const [parts, setParts] = createSignal(["os"]);
      const [files, setFiles] = createSignal([]);

      const fullPath = () => {
        return "/" + parts().join("/");
      }

      createEffect(() => {
        fs.readdir(fullPath()).then(files => setFiles(files))
      })
      

      return html`
        <div>
          <${AddressBar} replaceParts=${newParts => setParts(newParts)} parts=${() => parts()} />
          <${FileList} appendPath=${newPath => setParts([...parts(), newPath])} files=${() => files()} />
        </div>
      `;
    }

    const destroy = render(App, win.appContainer)


    app.openWindow(win);
  });
  return app;
}


const AddressBar = (props) => {

  const PartItem = (partProps) => {

    const onClick = () => {
      const pathFromHere = props.parts.slice(0, partProps.index + 1)
      props.replaceParts(pathFromHere);
    }

    const isLastPart = () =>partProps.part === "~" && !props.parts.length || partProps.index === props.parts.length - 1

    return html`
      <${Show} when=${() =>!partProps.hideArrow}><span class="material-icons-round arrow">chevron_right</span><//>
      <div onClick=${onClick} class=${() => `part ${isLastPart() ? "lastPart" : ""}`}>${partProps.part}</div>
    `
  }

  return html`
    <div class="addressBar">
      <${PartItem} part="~" hideArrow={true} />
      <${For} each=${() => props.parts}>
        ${(part, i) => html`<${PartItem} index=${() => i()} part=${() => part}/>`}
      <//>
    </div>
  `
}


const FileList = (props) => {
  
  const FileItem = (fileItemProps) => {
    const [metadata, setMetadata] = createSignal(null)

    const basename = () => path.basename(fileItemProps.path)
    const onDblClick = () => {
      props.appendPath(basename())
    }

    onMount(() => {
      fs.stat(fileItemProps.path).then((res) => {
        setMetadata(res)
      })
    })

    return html`
      <div class=${() => `fileItem ${metadata()?.directory ? "folder" : "file"}`} ondblclick=${onDblClick}>
        <span class="icon material-icons-round">${() => metadata()?.directory ? "folder" : "insert_drive_file"}</span>
        ${() => basename()}
        <div class='data'>
            ${() => metadata()?.type?.split("/")[1] || "Folder"} ${() => metadata()?.directory ? "" : ` • ${humanFileSize(metadata()?.size)}`}
        </div>
      </div>
    `
  }

  return html`
    <div class="fileList">
      <${For} each=${() => props.files}>
        ${(path, i) => html`<${FileItem} path=${() => path} />`}
      <//>
    </div>
  `
  
}



const createFilesList = (win, appendDir) => {
  const element = document.createElement("div");
  element.classList.add("fileList");

  element.addEventListener("dblclick", (e) => {
    const target = e.target;
    if (target instanceof HTMLDivElement) {
      const closestTo = target.closest(".fileItem");
      if (!closestTo.classList.contains("folder")) return;
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
        itemEl.classList.add(isFolder ? "folder" : "file");

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
