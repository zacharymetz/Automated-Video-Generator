import { Actor } from './actor';
import { readFileSync, mkdirSync } from 'fs';
import  { getAudioDurationInSeconds } from 'get-audio-duration'
import * as rimraf from 'rimraf';
import Jimp = require('jimp');
/**
 * the master object for the vide that is going to be generated 
 * you tell it what folder the script, voice and align files are 
 * and it will figure out what actors it needs, gives the actor the 
 * align file so theu can load their frame table 
 * and then this has the method called generate each frame and get it from 
 * all the actors and what not 
 */
export class Performance{
    actors:Actor[];
    projectFolder:string;
    durationInMiliseconds:number;
    framePerSecond: number;
    /**
     * 
     * @param projectName the folder in projects where all the script, align and voice is stored
     */
    constructor(projectName){
        this.actors = [];
        this.projectFolder = projectName;
        this.framePerSecond = 30;
        this.main();
        
    }

    //  need to wrap this in an async thing;
    async main(){
        await this.getAudioTractData();
        await this.loadActors();
        await this.generateAllFrames();
        this.exportVideoFile();
    }

    async getAudioTractData(){
        //  figure out how long the audio track is so we know how many 
        //  frames we need 
        this.durationInMiliseconds =  await new Promise((ok,reject)=>{
            let audioFile = "./projects/" + this.projectFolder + "/voice.mp3";
            getAudioDurationInSeconds(audioFile).then((duration) => {
                console.log(duration)
                ok(duration * 1000)
              })
            
        })
        
    }
    
    //  load the script and figure out what actors we need 
    loadActors(){

        //  first load the script 


        //  then look at the header of the script 
        //  and see what actors are in it 
        
        //  hard code it for now since we dont need to do anything
        //  really 
        for(let actor of ['testPope']){
            //  so we just tell it to make the thing good 
             
            let alignDataAny = JSON.parse( readFileSync('./projects/'+this.projectFolder+'/align.json', 'utf8'));
            let newActor = new Actor(actor)
            newActor.loadPhoneticInfo(alignDataAny.words);
            
            
            this.actors.push(newActor );
        }


        
    }






    async generateAllFrames(){

        //  here is the background 
   
        let frameFolder = "./tempframes";

        //  make a temp frames files  
        rimraf.sync(frameFolder);
        mkdirSync(frameFolder, { recursive: true });


        //  this is the main loop where we try to generate each frame 
        var frameTimeMilliseconds = 1000/this.framePerSecond;
        var frameNumber = 0;
        var frames = [];
        var currentTime = 0;
        while(currentTime < this.durationInMiliseconds){
            //  the file name string goes here
            let frameFilename = frameFolder + "/frame" + pad(frameNumber) + ".png";

            //  this is the main body where we generate each frame 
            let characterImage = await this.actors[0].getCharacterFrameAtTime(currentTime);
            //  go to the actors and find out what their image is 
            Jimp.read('./projects/'+this.projectFolder+'/background.png',(err, background) => {
        
                //  lets do some math so we can figure out to put the mouth in the 
                //  eact middle of the space 
                var middleX =   (characterImage.bitmap.width / 2)
                var middleY =   (characterImage.bitmap.height / 2)
                if (err) throw err;
                //  make sure to return the promise with an okey
                background.composite( characterImage.resize(middleX, middleY), 100, 0 ).write(frameFilename);
                 
            });
            
           





            //  modify the time thing here 
            currentTime = currentTime + frameTimeMilliseconds;
            frameNumber ++;
        }
    }
    
    //  calls ffmpeg to create the v
    exportVideoFile(){
        var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        var ffmpeg = require('fluent-ffmpeg');
        ffmpeg.setFfmpegPath(ffmpegPath);
        var command = ffmpeg();
        command.input('./tempframes/frame%08d.png')
        .inputFPS(30)
        .output('output.mp4')
        .outputFPS(30)
        //.noAudio()
        .input('./projects/'+this.projectFolder+'/voice.mp3')
        .run();
    }

    //  delets all the frames and possible actor images when the vide 
    //  is done being created 
    cleanupIntermediateFiles(){

    }
    
}

function pad(number:number){
    var numberString = number.toString();
    while(numberString.length < 8){
        numberString = "0" + numberString;
    }
    return numberString;
}