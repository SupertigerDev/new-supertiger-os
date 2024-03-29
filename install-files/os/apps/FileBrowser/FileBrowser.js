//ST_A
//PACKAGE_NAME="supertiger.os.filebrowser"
//ICON_PATH="./icon.webp"
//END

import fs from "../../fs.js";
import path from "../../path.js";
import { Application } from "../../Application.js";
import { Window } from "../../Window.js";
import { humanFileSize, styled } from "../../utils.js";

import {onCleanup, For, createSignal, Show, createEffect, onMount} from '../../solid-js/index.js'
import {render} from '../../solid-js/web/index.js'

import html from '../../solid-js/html/index.js'
import OS from "../../OS.js";
import config from '../../../../config.js';
function start() {
  const app = new Application();

  app.onReady(async () => {
    const win = new Window("File Browser", {
      width: 800,
      height: 600,
      icon: app.basePath + app.metadata.app.ICON_PATH,
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
          .icon {
            width: 24px;
            height: 24px;
            object-fit: contain;
          }
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
      const [fileStats, setFileStats] = createSignal([]);

      const fullPath = () => {
        return "/" + parts().join("/");
      }

      const getFileStats = async (path) => {
        const dirs = await fs.readdir(path);
        const stats = await Promise.all(dirs.map(async dir => {
          return fs.stat(dir);
        }))
        return stats;
      }

      createEffect(() => {
        getFileStats(fullPath()).then(stats => setFileStats(stats))
      })
      

      return html`
        <div>
          <${AddressBar} replaceParts=${newParts => setParts(newParts)} parts=${() => parts()} />
          <${FileList} win=${win} appendPath=${newPath => setParts([...parts(), newPath])} stats=${() => fileStats()} />
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
    const stat = () => fileItemProps.stat;

    const basename = () => path.basename(stat().path)
    const onDblClick = () => {
      if (!stat().directory) {
        if (basename().endsWith(".js")) {
          OS.openApplication(stat().path)
        }
        return;
      };
      props.appendPath(basename())
    }


    const Icon = () => {

      const dirname = () => path.dirname(stat().path);

      const iconFile = () => stat()?.app?.ICON_PATH ? path.join(config.BASEPATH, "/hdd" + dirname(), stat()?.app?.ICON_PATH) : null;


      return html `
        <${Show} when=${() => iconFile()}><img class="icon" src=${() => iconFile()}/></Show>
        <${Show} when=${() => !iconFile()}><span class="icon material-icons-round">${() => stat()?.app ? "extension" : stat()?.directory ? "folder" : "insert_drive_file"}</span><//>
      `
    }

    return html`
      <div class=${() => `fileItem ${stat()?.directory ? "folder" : "file"}`} ondblclick=${onDblClick}>
        <${Icon} />
        ${() => basename()}
        <div class='data'>
            ${() => stat()?.app ? "Supertiger OS App" : stat()?.type?.split("/")[1] || "Folder"} ${() => stat()?.directory ? "" : ` • ${humanFileSize(stat()?.size)}`}
        </div>
      </div>
    `
  }
  const sortedStats = () => {
    return props.stats.sort((a, b) => {
      if (a.directory && !b.directory) {
        return -1;
      }
      if (!a.directory && b.directory) {
        return 1;
      }
      const basenameA = path.basename(a.path);
      const basenameB = path.basename(b.path);
      return basenameA.localeCompare(basenameB);
    })
  }

  return html`
    <div class="fileList">
      <${For} each=${() => sortedStats()}>
        ${(stat, i) => html`<${FileItem} stat=${() => stat} />`}
      <//>
    </div>
  `
  
}


export { 
  start
};
