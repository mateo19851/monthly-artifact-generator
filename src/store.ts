import { createStore, Store, combineReducers } from '@reduxjs/toolkit'
import { ArtifactElement } from './models/ArtifactElement';
import { AppState, foldersReducer } from './reducers/foldersSlice';

const rootReducer = combineReducers<AppState>({
   artifacts: foldersReducer,
 });

export function configureStore(): Store<AppState> {
   const folderStateStorageName: string = "foldersState";
   let readFromStorage = localStorage.getItem(folderStateStorageName);
   let parsedFromStorage = readFromStorage ? JSON.parse(readFromStorage) : new Array<ArtifactElement>();
   const store = createStore(
     rootReducer,
     {
      artifacts: parsedFromStorage
     }
   );

   return store;
 }