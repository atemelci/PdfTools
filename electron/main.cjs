const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

// Single-instance lock: double-clicking the exe again focuses the open window
// instead of starting a second copy.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  let mainWindow = null;

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1440,
      height: 920,
      minWidth: 900,
      minHeight: 600,
      backgroundColor: "#F4F3EF",
      show: false,
      autoHideMenuBar: true,
      icon: path.join(__dirname, "..", "build", "icon.ico"),
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        spellcheck: false,
      },
    });

    // No application menu — this is a single-window tool, not a document editor.
    Menu.setApplicationMenu(null);

    // The built front-end lives next to this file inside the packaged app.
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));

    mainWindow.once("ready-to-show", () => mainWindow.show());

    // Open any external (http/https) links in the user's default browser
    // rather than inside the app window.
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith("http")) {
        shell.openExternal(url);
        return { action: "deny" };
      }
      return { action: "allow" };
    });

    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }

  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
