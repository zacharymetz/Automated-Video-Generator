import { Actor } from './actor';

/**
 * the master object for the vide that is going to be generated 
 * you tell it what folder the script, voice and align files are 
 * and it will figure out what actors it needs, gives the actor the 
 * align file so theu can load their frame table 
 * and then this has the method called generate each frame and get it from 
 * all the actors and what not 
 */
export class Performance{
    actors:Actor[]
    durationInMiliseconds:number;
    /**
     * 
     * @param projectName the folder in projects where all the script, align and voice is stored
     */
    constructor(projectName){
        this.actors = [];
        this.getAudioTractData();
        this.getScriptMetadata();
        
    }

    getAudioTractData(){
        //  figure out how long the audio track is so we know how many 
        //  frames we need 
    }
    
    //  load the script and figure out what actors we need 
    getScriptMetadata(){

        //  first load the script 


        //  then look at the header of the script 
        //  and see what actors are in it 
        


        
    }



    initalizeActors(){
        //  this is where we create actor object and 
        //  give it the align file so that it knows when it 
        //  needs to be in what frame 

    }


    generateAllFrames(){
        //  this is the main loop where we try to generate each frame 

    }
    
    //  calls ffmpeg to create the v
    exportVideoFile(){

    }

    //  delets all the frames and possible actor images when the vide 
    //  is done being created 
    cleanupIntermediateFiles(){

    }
    
}