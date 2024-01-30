import { Application } from "../Application.js";
import { Window } from "../Window.js";
import { styled } from "../utils.js";



function start() {
  const app = new Application();

  app.onReady(() => {
    const win = new Window("Desktop");
    win.showFrame(false);
    win.setWidth(window.innerWidth);
    win.setHeight(window.innerHeight);
    win.setX(0);
    win.setY(0);

    window.addEventListener("resize", () => {
      win.setWidth(window.innerWidth);
      win.setHeight(window.innerHeight);
    });

    win.baseElement.insertAdjacentHTML("beforeend", styled(win).css`
      &.window {
        border-radius: 0;
      }
      .bg {
        position: relative;
        background-color: black;
        width: 100%;
        height: 100%;
        &::after {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0;
          background: url(${app.basePath + "../assets/wallpaper.jpg"});
          animation: FadeInWallpaper 0.2s;
          animation-delay: 0.3s;
          animation-fill-mode: forwards;
        }
      }

      @keyframes FadeInWallpaper {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }


    `);


    win.appContainer.innerHTML += `
      <div class="bg"></div>
    `;
    app.openWindow(win);
  });
  return app;
}

export { start };
