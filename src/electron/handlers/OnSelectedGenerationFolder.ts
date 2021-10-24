import { dialog } from 'electron';
import fs from 'fs';
import path from 'path';

let onSelectedGenerationFolder = async (event: any) => {
   let result = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections', 'openDirectory'] });
   event.returnValue = result.filePaths.map(x => {
      return {
         folderPath: x,
         repositoryType: fs.existsSync(path.join(x, ".hg")) ? 'Mercurial': 'Git'
      }
   });
 };

 export default onSelectedGenerationFolder;