const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const https = require("https");
const RAW = "https://raw.githubusercontent.com/hslatman/awesome-threat-intelligence/main/README.md";
function syncDatabase(){return new Promise(resolve=>{https.get(RAW,{headers:{"User-Agent":"ThreatIntel-Portal"}},res=>{let d="";res.on("data",c=>d+=c);res.on("end",()=>{if(res.statusCode===200&&d.length>1000)fs.writeFileSync(path.join(__dirname,"database.md"),d,"utf8");resolve();});}).on("error",resolve);});}
async function createWindow(){await syncDatabase();const win=new BrowserWindow({width:1400,height:900,minWidth:900,minHeight:620,backgroundColor:"#070b12",webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false}});win.loadFile(path.join(__dirname,"index.html"));}
app.whenReady().then(createWindow);app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit();});