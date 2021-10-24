import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { ArtifactElement } from '../../models/ArtifactElement';
import fs from 'fs';
import path from 'path';
let exec = require("child_process").exec;

function formatDate(date: Date) {
   return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

let onInvokeRepository = async (e: any, selectedMonth: Date, artifact: ArtifactElement, outputDir: string) => {
   let firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
   let lastDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

   let generateLogFile: (error: any, out: any, artifact :ArtifactElement) => void = (err: any, out: any, artifact: ArtifactElement) => {
      if (!err) {
         let splitedPath = artifact.path.split(path.sep);
         let outputFilePath = path.join(outputDir, `${splitedPath[splitedPath.length - 1]}.log`);
         fs.writeFileSync(outputFilePath, out.toString());
      }
      
      BrowserWindow.getFocusedWindow()?.webContents?.send('log-generated', artifact.path, err);
   };

   if (artifact.repositoryType === "Git") {
      exec(`git log --since="${formatDate(firstDay)}" --until="${formatDate(lastDay)}" --branches --author=Mateusz.Malik@hidglobal.com --log-size`,
       { cwd: artifact.path },
       (e: any, o: any) => generateLogFile(e, o, artifact) );
    }

    if (artifact.repositoryType === "Mercurial") {
      exec(`hg log -d "${formatDate(firstDay)} to ${formatDate(lastDay)}" -p -u "Mateusz.Malik@hidglobal.com"`, 
         { cwd: artifact.path }, (e: any, o: any) => generateLogFile(e, o, artifact));
    }
 };

 export default onInvokeRepository;