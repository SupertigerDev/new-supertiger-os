import { Window } from "./Window.js";

export class Application {
    constructor(name) {
      this.metadata = null;
      this.id = "a"+crypto.randomUUID();
      this.name = name || this.id;
      this.basePath = "/";
      this.readyAt = null;
      /**
       * @type {Window[]}
       */
      this.windows = [];        

      this._onReadyCallback = null;
    }
    /**
     * @param {Window} window - the window to be shown
     */
    openWindow (window) {
      window.app = this;
      this.windows.push(window);
      if (window.zIndex === null) {
        window.setZIndex(this.windows.length - 1);
      }
      document.getElementById("root").appendChild(window.baseElement);
    }
    _ready () {
      this._onReadyCallback?.();
    }
    onReady (callback) {
      if (this.readyAt) {
        callback();
        return;
      }
      this._onReadyCallback = callback;
    }
}