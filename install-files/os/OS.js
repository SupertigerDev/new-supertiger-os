import config from "../../config.js";
import fs from "../os/fs.js";
import { Application } from "./Application.js";
import { getBasePath } from "./utils.js";

fs.init();

export class OS {
  constructor() {
    /**
     * @type {Application[]}
     */
    this.applications = [];
  }
  /**
   * @param {string} path
   */
  async openApplication(path) {
    const metadata = await fs.stat(path);
    if (!metadata?.app) {
      return alert("Invalid app");
    }
    const { start } = await import(config.BASEPATH + "hdd" + path);
    /**
     * @type {Application}
     */
    const app = start();
    app.metadata = await fs.stat(path);
    app.basePath =
      getBasePath(import.meta.resolve(config.BASEPATH + "hdd" + path)) + "/";
    this.applications.push(app);
    app._ready();
  }
}

const os = new OS();

export default {
  openApplication: (path) => os.openApplication(path),
};

os.openApplication("/os/apps/Desktop.js");
os.openApplication("/os/apps/Taskbar/Taskbar.js");

setTimeout(() => {
  os.openApplication("/os/apps/FileBrowser/FileBrowser.js");
}, 1000);
