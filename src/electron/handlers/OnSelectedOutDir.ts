import { dialog } from 'electron';

let onSelectedOutDir = async (event: any) => {
   let result = await dialog.showOpenDialog({properties: ['openDirectory']});
   event.returnValue =  result.filePaths[0];
 };

 export default onSelectedOutDir;