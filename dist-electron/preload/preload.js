"use strict";const e=require("electron");e.contextBridge.exposeInMainWorld("electronAPI",{getAppVersion:()=>e.ipcRenderer.invoke("get-app-version")});
