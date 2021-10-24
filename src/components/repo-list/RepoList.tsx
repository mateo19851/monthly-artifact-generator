import { FC } from 'react';
import { useState, createRef, useReducer } from 'react'
import ListGroup from 'react-bootstrap/ListGroup';
import Dropdown from 'react-bootstrap/Dropdown'
import InputGroup from 'react-bootstrap/InputGroup';
import { FormControl, Popover, OverlayTrigger, Button } from 'react-bootstrap';
import { ArtifactElement } from '../../models/ArtifactElement';
const { ipcRenderer } = window.require("electron");
import repoType from '../../models/RepoTypes';
import { ArtifactGenerationOutput } from 'src/models/ArtifactGenerationOutput';
import { useSelector, useDispatch } from 'react-redux'
import { AppState, AddFolder, ClearAll, RemoveFolder, SetRepoType } from "../../reducers/foldersSlice";

interface RepoListProps {
   artifacts: ArtifactElement[];
   isGenerating: boolean;
   generated: ArtifactGenerationOutput[];
}

export const RepoList: FC<RepoListProps> = (repoListProps: RepoListProps) => {
   let dispatch = useDispatch();
   const folders: ArtifactElement[] = useSelector((state: AppState) => state.artifacts);
   const folderStateStorageName: string = "foldersState";
   let readFromStorage = localStorage.getItem(folderStateStorageName);
   
   let parsedFromStorage = readFromStorage ? JSON.parse(readFromStorage) : new Array<ArtifactElement>();
   let [selectedItem, setSelectedItem] = useState<string>("")
   const handleSelectFolder = () => {
      
      let i = ipcRenderer.sendSync("selected-generation-folder");
      let newFolders = i.map((element: any) => {
         return {
            path: element.folderPath,
            repositoryType: element.repositoryType
         }
      });

      dispatch(AddFolder(newFolders));
   };

   const popover =(err: any) => {
      return <Popover id="popover-basic">
        <Popover.Header as="h3">Error:</Popover.Header>
        <Popover.Body>
          {err.toString()}
        </Popover.Body>
      </Popover>
   };

   const buttonWithError = (err: any) => {
      return <OverlayTrigger trigger="click" placement="right" overlay={popover(err)}>
         <Button variant="success">❗</Button>
      </OverlayTrigger>
   };

   const handleClearAll = () => {
      //setFolders([]);
      dispatch(ClearAll());
   };

   const onElementClick: any = (e: any, i: string) => {
      setSelectedItem(i);
   };

   const handleSelectRemove = (e: any, i: string) => {
      //let foldersTmp = folders.filter(x => x.path !== i);
      //setFolders([...foldersTmp]);
      dispatch(RemoveFolder(i));
      //localStorage.setItem(folderStateStorageName, JSON.stringify([...foldersTmp]));
   };

   const onRepositoryTypeChanged = (event: any, path: string, repoType: string) => {
      let foundObjects = folders.find(x => x.path === path);
      if (foundObjects) {
         foundObjects.repositoryType = repoType;
      } 
      
      dispatch(SetRepoType(path, repoType));
      //setFolders([...folders]);
      localStorage.setItem(folderStateStorageName, JSON.stringify([...folders]));
   };

   return <div className="elementList">
      <h1>Items:</h1>
      <div className="listOperations">
         <Button disabled={repoListProps.isGenerating} onClick={handleSelectFolder}>Add folder</Button>
         <Button disabled={repoListProps.isGenerating} onClick={handleClearAll}>Clear all</Button>
      </div>
      <ListGroup>
         {folders.map((i) => {
            return <div>
               <ListGroup.Item variant={repoListProps.generated.some(x => x.path === i.path) ? ( repoListProps.generated.find(x => x.path === i.path && x.generationError) ? "danger" : "success" ) : "light" } key={i.path} onClick={(e:React.MouseEvent<HTMLInputElement>) => {onElementClick(e, i.path)}} 
                  active={selectedItem === i.path}>
                  <div className="listGroupItem">
                     <span className="closeButton" onClick={(e: React.MouseEvent<HTMLElement>) => handleSelectRemove(e, i.path)}>✕</span>
                     <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                           {i.repositoryType}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                           {
                              repoType.map(s => {
                                 return <Dropdown.Item 
                                 onClick={(e:  React.MouseEvent<HTMLElement>) => onRepositoryTypeChanged(e, i.path, s)}>
                                    {s}
                                    </Dropdown.Item>
                              })
                           }
                        </Dropdown.Menu>
                     </Dropdown>

                     <span>{i.path}</span>
                     {repoListProps.generated.some(x => x.path === i.path && x.generationError) && buttonWithError(repoListProps.generated.find(x => x.path === i.path)?.generationError)}
                  </div>
               </ListGroup.Item>
            </div>
         })}
      </ListGroup>
  
</div>
};