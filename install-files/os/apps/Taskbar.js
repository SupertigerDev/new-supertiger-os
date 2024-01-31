import { Application } from "../Application.js";
import { Window } from "../Window.js";
import { styled } from "../utils.js";

const HEIGHT = 50;
const MARGIN = 80;

function start() {
  const app = new Application();

  app.onReady(() => {
    const win = new Window("Test Window");
    win.showFrame(false);
    win.setWidth(window.innerWidth - MARGIN * 2);
    win.setX(MARGIN);
    win.setHeight(HEIGHT);

    win.setY(window.innerHeight);

    window.addEventListener("resize", () => {
      win.setWidth(window.innerWidth - MARGIN * 2);
      win.setX(MARGIN);
      win.setY(window.innerHeight);
    });

    win.baseElement.insertAdjacentHTML("beforeend", styled(win).css`
      &.window {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        animation: slideUp 0.2s;
        animation-fill-mode: forwards;
        animation-delay: 0.6s;
        background-color: rgba(0,0,0,0.4);
        border-bottom: 0;
      }

      @keyframes slideUp {
        from {
          transform: translateY(0);
        }
        to {
          transform: translateY(-100%);
        }
      }
    `);


    win.appContainer.innerHTML += `
      <div>hello</div>
    `;

    app.openWindow(win);
    win.setZIndex(9999999999)
  });
  return app;
}

export { start };
