import { Application } from "./os/Application.js";
import { Window } from "./os/Window.js";


const HEIGHT = 50;
const MARGIN = 80;

function start () {
    const app = new Application();

    app.onReady(() => {
        const win = new Window("Test Window");
        win.showFrame(false);
        win.setWidth(window.innerWidth - MARGIN * 2);
        win.setX(MARGIN)
        win.setHeight(HEIGHT);
        win.baseElement.style.borderBottomRightRadius = "0";
        win.baseElement.style.borderBottomLeftRadius = "0";
        
        win.setY(window.innerHeight);
        animateInTaskbar(win, win.baseElement)
        
        
        window.addEventListener("resize", () => {
            win.setWidth(window.innerWidth - MARGIN * 2);
            win.setX(MARGIN)
            win.setY(window.innerHeight - HEIGHT - 1);
        });

        win.appContainer.innerHTML = `test`


        app.openWindow(win);
    })
    return app;
}

const animateInTaskbar = (win, element) => {
    element.style.transition = "0.2s";
    setTimeout(() => {
        win.setY(window.innerHeight - HEIGHT - 1);
        setTimeout(() => {
            element.style.transition = "initial";
        }, 200);
    }, 200);
}



export {start};