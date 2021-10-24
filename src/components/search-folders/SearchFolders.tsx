import * as React from 'react';
import { useState, createRef, useReducer } from 'react'
const { ipcRenderer } = window.require("electron");
import ListGroup from 'react-bootstrap/ListGroup';
import Dropdown from 'react-bootstrap/Dropdown'
import InputGroup from 'react-bootstrap/InputGroup';
import { FormControl, Popover, OverlayTrigger, Button } from 'react-bootstrap';
import { ArtifactElement } from '../../models/ArtifactElement';
import useGenerateOutputs from '../../hooks/useGenerateOutputs';
let image = require('/img/planets.png');
import './SearchFolders.styles.css';
import { RepoList } from '../repo-list/RepoList';
import { AppState, AddFolder, ClearAll, RemoveFolder } from "../../reducers/foldersSlice";
import { useSelector, useDispatch } from 'react-redux'

export const SearchFolders: React.FC<{}> = () => {
   const artifacts: ArtifactElement[] = useSelector((state: AppState) => state.artifacts);

   let monthCalendarRef = createRef<HTMLInputElement>();
   let [outputDir, setOutputDir] = useState('');
   let [generated, isGenerating, handleGeneration] = useGenerateOutputs();
   
   React.useEffect(() => {
      setOutputDir(localStorage.getItem("outputDirectory") as string);   
   }, []);

   let folders: ArtifactElement[] = [];
   const onGenerate = (event: any) => {
      if (!monthCalendarRef || !monthCalendarRef.current || !monthCalendarRef?.current?.valueAsDate) {
         return;
      }
      
      handleGeneration(artifacts, monthCalendarRef.current.valueAsDate, outputDir);
   };

   const onOutputDirectorySelected: any  = (event: any) => {
      let localOutputDir = ipcRenderer.sendSync('selected-out-dir');
      if (!localOutputDir) {
         return;
      }

      setOutputDir(localOutputDir);
      localStorage.setItem('outputDirectory', localOutputDir);
   } 


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

      <RepoList artifacts={new Array<ArtifactElement>()} isGenerating={false} generated={generated} />
   </div>
};