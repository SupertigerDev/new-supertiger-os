//ST_A
//PACKAGE_NAME="supertiger.os.taskbar"
//ICON_PATH=""
//END

import { Application } from "../../Application.js";
import { Window } from "../../Window.js";
import { styled } from "../../utils.js";

import {
  onCleanup,
  For,
  createSignal,
  Show,
  createEffect,
  onMount,
} from "../../solid-js/index.js";
import html from "../../solid-js/html/index.js";
import { render } from "../../solid-js/web/index.js";

const HEIGHT = 50;
const MARGIN = 80;

function start() {
  const app = new Application();

  app.onReady(() => {
    let menuListOpened = false;
    const win = new Window("Test Window");

    const menuListWindow = new Window("Menu List Window");
    menuListWindow.showFrame(false);
    menuListWindow.setX(MARGIN);
    menuListWindow.setY(window.innerHeight);
    menuListWindow.setZIndex(999999999);

    app.openWindow(menuListWindow);

    win.showFrame(false);
    win.setWidth(window.innerWidth - MARGIN * 2);
    win.setX(MARGIN);
    win.setHeight(HEIGHT);

    win.setY(window.innerHeight);

    const adjustPosition = () => {
      win.setWidth(window.innerWidth - MARGIN * 2);
      win.setX(MARGIN);
      win.setY(window.innerHeight);
      menuListWindow.setX(MARGIN);
      if (menuListOpened) {
        menuListWindow.setY(
          window.innerHeight - HEIGHT - menuListWindow.height - 8
        );
      } else {
        menuListWindow.setY(window.innerHeight);
      }
    };

    window.addEventListener("resize", adjustPosition);

    win.baseElement.insertAdjacentHTML(
      "beforeend",
      styled(win).css`
      &.window {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        animation: slideUp 0.2s;
        animation-fill-mode: forwards;
        animation-delay: 0.6s;
        background-color: rgba(0,0,0,0.4);
        border-radius: 9px;
        border-bottom: 0;
      }
      .appContainer {
        align-items: center;
        margin-left: 2px;
      }
      .menuListButton {
        border-radius: 6px;
        height: 46px;
        width: 46px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: 0.2s;
        &:hover {
          background-color: rgba(255,255,255,0.1);
        }
        &:active {
          transform: scale(0.9);
        }
        img {
          width: 44px;
          height: 44px;
        }

      }

      @keyframes slideUp {
        from {
          transform: translateY(0);
        }
        to {
          transform: translateY(-100%);
        }
      }
    `
    );

    const toggleMenuList = () => {
      menuListOpened = !menuListOpened;
      adjustPosition();
    };

    const App = () => {
      return html`<div>
        <${Item}
          onClick=${(_) => toggleMenuList()}
          iconSrc="${app.basePath + "startIcon.png"}"
        />
      </div> `;
    };

    const destroy = render(App, win.appContainer);

    app.openWindow(win);
    win.setZIndex(9999999999);
  });
  return app;
}

const Item = (props) => {
  return html`
    <div class="menuListButton" onClick=${props.onClick}>
      <img src="${props.iconSrc}" />
    </div>
  `;
};

export { start };
