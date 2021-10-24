import * as React from 'react';
import { useState, createRef } from 'react'
const { ipcRenderer } = window.require("electron");
import ListGroup from 'react-bootstrap/ListGroup';
import Dropdown from 'react-bootstrap/Dropdown'
import InputGroup from 'react-bootstrap/InputGroup';
import { FormControl, Popover, OverlayTrigger, Button } from 'react-bootstrap';
import { ArtifactElement } from '../../models/ArtifactElement';
import useGenerateOutputs from '../../hooks/useGenerateOutputs';
let image = require('/img/planets.png');
import './SearchFolders.styles.css';
let repoType: string[] = [
   "Git",
   "Mercurial"
];

export const SearchFolders: React.FC<{}> = () => {
   const folderStateStorageName: string = "foldersState";
   let readFromStorage = localStorage.getItem(folderStateStorageName);
   let parsedFromStorage = readFromStorage ? JSON.parse(readFromStorage) : new Array<ArtifactElement>();
   let [folders, setFolders] = useState<ArtifactElement[]>(parsedFromStorage);
   let monthCalendarRef = createRef<HTMLInputElement>();
   let [outputDir, setOutputDir] = useState('');

   let [generated, isGenerating, handleGeneration] = useGenerateOutputs()

   
   React.useEffect(() => {
      setOutputDir(localStorage.getItem("outputDirectory") as string);   
   }, []);

   let [selectedItem, setSelectedItem] = useState<string>("")

   const handleSelectFolder = () => {
      let i = ipcRenderer.sendSync("selected-generation-folder");
      let newFolders = i.map((element: any) => {
         return {
            path: element.folderPath,
            repositoryType: element.repositoryType
         }
      });

      localStorage.setItem(folderStateStorageName, JSON.stringify([...folders, ...newFolders]));
      setFolders([...folders, ...newFolders]);
   };

   const onElementClick: any = (e: any, i: string) => {
      setSelectedItem(i);
   };

   const handleSelectRemove = (e: any, i: string) => {
      let foldersTmp = folders.filter(x => x.path !== i);
      setFolders([...foldersTmp]);
      localStorage.setItem(folderStateStorageName, JSON.stringify([...foldersTmp]));
   };

   const onRepositoryTypeChanged = (event: any, path: string, repoType: string) => {
      let foundObjects = folders.find(x => x.path === path);
      if (foundObjects) {
         foundObjects.repositoryType = repoType;
      } 
      
      setFolders([...folders]);
      localStorage.setItem(folderStateStorageName, JSON.stringify([...folders]));
   };

   const onGenerate = (event: any) => {
      if (!monthCalendarRef || !monthCalendarRef.current || !monthCalendarRef?.current?.valueAsDate) {
         return;
      }
      
      handleGeneration(folders, monthCalendarRef.current.valueAsDate, outputDir);
   };

   const onOutputDirectorySelected: any  = (event: any) => {
      let localOutputDir = ipcRenderer.sendSync('selected-out-dir');
      if (!localOutputDir) {
         return;
      }

      setOutputDir(localOutputDir);
      localStorage.setItem('outputDirectory', localOutputDir);
   } 

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
      setFolders([]);
   };

   
   return <div className="searchFolderContainer">
      <div className="header">
         <img className={"imageLogo " + (isGenerating && "generating")} src={image} />
         <Button disabled={isGenerating} onClick={onGenerate}>Generate</Button>
         <input type="month" ref={monthCalendarRef}/>
      </div>

      <div>
         <InputGroup className="mb-3">
            <Button disabled={isGenerating} onClick={onOutputDirectorySelected} variant="outline-secondary" id="button-addon1">
               Output directory
            </Button>
            <FormControl placeholder="Output directory" value={outputDir} readOnly/>
         </InputGroup>
      </div>

      <div className="elementList">
         <h1>Items:</h1>
         <div className="listOperations">
            <Button disabled={isGenerating} onClick={handleSelectFolder}>Add folder</Button>
            <Button disabled={isGenerating} onClick={handleClearAll}>Clear all</Button>
         </div>
         <ListGroup>
            {folders.map((i) => {
               return <div>
                  <ListGroup.Item variant={generated.some(x => x.path === i.path) ? ( generated.find(x => x.path === i.path && x.generationError) ? "danger" : "success" ) : "light" } key={i.path} onClick={(e:React.MouseEvent<HTMLInputElement>) => {onElementClick(e, i.path)}} 
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
                        {generated.some(x => x.path === i.path && x.generationError) && buttonWithError(generated.find(x => x.path === i.path)?.generationError)}
                     </div>
                  </ListGroup.Item>
               </div>
            })}
         </ListGroup>
        
      </div>
   </div>
};