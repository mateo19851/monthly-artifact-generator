import { createSlice } from '@reduxjs/toolkit';
import { ArtifactElement } from 'src/models/ArtifactElement';


const folderStateStorageName: string = "foldersState";

export type AppState = {
   artifacts: ArtifactElement[];
};

export function AddFolder(folders: ArtifactElement[]) {
   return {
     type: "AddFolder",
     payload: folders,
   } as const;
 }
 
 export function RemoveFolder(path: string) {
   
   return {
     type: "RemoveFolder",
     payload: path,
   } as const;
 }

 export function SetRepoType(path: string, repoType: string) {
   return {
     type: "SetRepoType",
     payload: {
        path: path,
        repoType: repoType
     },
   } as const;
 }

 export function ClearAll() {
   return {
     type: "ClearAll"
   } as const;
 }

 type Actions =
  | ReturnType<typeof AddFolder>
  | ReturnType<typeof RemoveFolder>
  | ReturnType<typeof SetRepoType>
  | ReturnType<typeof ClearAll>;

  export function foldersReducer(state: ArtifactElement[] = [], action: Actions) {
   switch (action.type) {
     case "AddFolder":
       localStorage.setItem(folderStateStorageName, JSON.stringify(state.concat([...action.payload])));
       return state.concat([...action.payload]);
     case "RemoveFolder":
       localStorage.setItem(folderStateStorageName, JSON.stringify(state.filter(x => x.path !== action.payload)));
       return state.filter(x => x.path !== action.payload);
     case "SetRepoType":
         let foundElement = state.find(x => x.path === action.payload.path);
         if (foundElement) {
            foundElement.repositoryType = action.payload.repoType;
         }

         localStorage.setItem(folderStateStorageName, JSON.stringify([...state]));
         return [...state];
      case "ClearAll":
         localStorage.setItem(folderStateStorageName, JSON.stringify([]));
         return []
     default:
       neverReached(action);
   }
   return state;
 }
 
 function neverReached(never: never) {}

