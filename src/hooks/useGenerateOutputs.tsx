import React, { useState, useRef, useEffect } from "react";
import { ArtifactElement } from "src/models/ArtifactElement";
import { ArtifactGenerationOutput } from 'src/models/ArtifactGenerationOutput'
import { ipcRenderer } from 'electron';


let useGenerateOutputs = () => {
   let [isGenerating, setGenerate] = useState<boolean>(false);
   let [artifactGenerationOutput, setArtifactGenerationOutput] = useState<ArtifactGenerationOutput[]>([]);
   let [generatedCnt, setGeneratedCnt] = useState<{generated: number, toGenerate: number | undefined}>({
      generated: 0,
      toGenerate: undefined
   });
   let handleGeneration = (artifacts: ArtifactElement[], generationDate: Date, outputDir: string): void => {
      setGeneratedCnt({
         generated: 0,
         toGenerate: artifacts.length
      });
      setArtifactGenerationOutput([]);
      setGenerate(true);
      artifacts.forEach(i => {
         ipcRenderer.send('invoke-repository', generationDate, i, outputDir);
      });
   };

   React.useEffect(() => {
      let logGeneratedHandler = ipcRenderer.on('log-generated', (event,folder, err) => {
         setGeneratedCnt({
            generated: ++generatedCnt.generated,
            toGenerate: generatedCnt.toGenerate
         });

         artifactGenerationOutput.push({
            generationError: err,
            path: folder
         });
         setArtifactGenerationOutput(artifactGenerationOutput);
         if (generatedCnt.generated == generatedCnt.toGenerate) {
            setGenerate(false)
         }
      });

      return () => {
         logGeneratedHandler.removeAllListeners('log-generated');
      }
   
   });

   return [
      artifactGenerationOutput,
      isGenerating,
      handleGeneration
   ] as const;
};

export default useGenerateOutputs;