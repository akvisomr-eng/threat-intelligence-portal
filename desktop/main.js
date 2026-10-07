const {app,BrowserWindow}=require("electron");
const path=require("path");

const PORTAL_URL="https://akvisomr-eng.github.io/threat-intelligence-portal/";

function createWindow(){
  const win=new BrowserWindow({
    width:1400,
    height:900,
    minWidth:900,
    minHeight:620,
    backgroundColor:"#070b12",
    title:"Threat Intelligence Portal — AURA Nusantara",
    webPreferences:{
      preload:path.join(__dirname,"preload.js"),
      contextIsolation:true,
      nodeIntegration:false,
      sandbox:true
    }
  });

  win.loadURL(PORTAL_URL,{extraHeaders:"Cache-Control: no-cache\n"});
}

app.whenReady().then(createWindow);
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit();});
app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});
