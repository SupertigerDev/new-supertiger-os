import { Application } from "./Application.js";
import { getBasePath } from "./utils.js";
export class OS {
    constructor() {
        /**
         * @type {Application[]}
         */
        this.applications = []
    }
    /**
     * @param {string} path
     */
    async openApplication (path) {
        const {start} = await import(path);
        /**
         * @type {Application}
         */
        const app = start();
        app.basePath = getBasePath(import.meta.resolve(path)) + "/"
        this.applications.push(app);
        app._ready()
    }
}

const os = new OS();

os.openApplication("./TestApp.js")