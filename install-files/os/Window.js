import { Application } from "./Application.js";

export class Window {
    constructor(name) {
        /**
         * @type {Application[]}
         */
        this.app = null;
        this.id = "w-"+crypto.randomUUID()
        this.name = name || this.id;

        this.width = 200;
        this.height = 200;

        this.x = window.innerWidth / 2 - this.width / 2;
        this.y = window.innerHeight / 2 - this.height / 2;

        this.frame = true;
        this.appContainer = createAppContainer(this);
        this.baseElement = createFrame(this);
        this.zIndex = 0;
    }
    showFrame (value) {
        if (this.baseElement.querySelector(".topBar")) {
            this.baseElement.querySelector(".topBar").remove();
        } else {
            this.baseElement.prepend(createTopBar(this));
        }
        this.frame = value;
    }
    setX (x) {
        this.x = x;
        this.baseElement.style.left = this.x + "px";
    }
    setY (y) {
        this.y = y;
        this.baseElement.style.top = this.y + "px";
    }
    setWidth (width) {
        this.width = width;
        this.baseElement.style.width = this.width + "px";
    }
    setHeight (height) {
        this.height = height;
        this.baseElement.style.height = this.height + "px";
    }
    setZIndex (zIndex) {
        this.zIndex = zIndex;
        this.baseElement.style.zIndex = this.zIndex;
    }
}

/**
 * Creates a frame using the provided window object.
 *
 * @param {Window} window - The window object to use for creating the frame.
 * @return {HTMLElement} The newly created container element.
 */
function createFrame(window) {
    const container = document.createElement("div");
    container.id = window.id;
    container.classList.add("window");
    container.style.left = window.x + "px";
    container.style.top = window.y + "px";

    container.style.width = window.width + "px";
    container.style.height = window.height + "px";
    
 
    const topBar = createTopBar(window);

    container.appendChild(topBar);
    container.appendChild(window.appContainer);

    return container;
}

const createAppContainer = (window) => {
    const appContainer = document.createElement("div");
    appContainer.classList.add("appContainer");
    return appContainer;
}

const createTopBar = (window) => {
    const topBar = document.createElement("div");
    topBar.classList.add("topBar");

    topBar.innerHTML = `
        <div class="title">${window.name}</div>
        <div class="closeButton">X</div>
    `
    return topBar;
}
