import { SceneObject, StaticPositiontable, createActor } from "./scene";
import { readFileSync, mkdirSync } from "fs";
import * as rimraf from 'rimraf';
import Jimp = require("jimp");
import { Worker } from 'worker_threads';
const { getAudioDurationInSeconds } = require('get-audio-duration')
//  for now a project has one scene, 
export class Project{
    projectFolder:string;
    rootScene:SceneObject;
    framePerSecond: number;
    durationInMilliseconds:number;
    frameFilePadding:number;
    numberOfRenderThreads:number;
    constructor(name:string){
        this.projectFolder = name;
        //  for now it conatins one scene and 
        //  it is the same as the project directory 
        this.rootScene = new SceneObject(name,'projects',"background.png");
        this.framePerSecond = 30
        this.numberOfRenderThreads = 8;

        //  start the main code body which is async
        this.main();
    }

    async main(){
        //  first we need to load the script 
        await this.loadAudioInfo();
        await this.loadScript();

        await this.generateFrames();
        this.generateProjectVideo();
    }
    async loadAudioInfo() {
        let duration =  await getAudioDurationInSeconds("./projects/"+this.projectFolder+'/voice.mp3');
        
        this.frameFilePadding = 8
        
        this.durationInMilliseconds = duration * 1000;
        return duration;
    }
    
    
    async loadScript():Promise<void>{
        //  load it and split it into a list of lines 
        let scriptLines = readFileSync('./projects/'+this.projectFolder+'/script.txt', 'utf8')
                     .split(/\r?\n/)
         

        //  we should load in the align file before the script 
        //  so we can do the matching for the pose transition times 
        //  and stuff 
        let alignFile = JSON.parse( readFileSync('./projects/'+this.projectFolder+'/align.json', 'utf8'));


        //  the first line is the name of the output filkes
        let outputFileName:string = scriptLines.pop();
        //  loop though the lines untill we get the [startbody] tag 
        let actorName:string;
        let actorTracks = new Map<string,Map<string,any>>();
        //  set the word track for the actor 
        actorTracks.set("words",alignFile.words);
        actorTracks.set("eyes",new Map<string,any>());
        let currentLine = scriptLines.shift();
        console.log(scriptLines)
        while(currentLine != "[bodyStart]"){console.log(currentLine)
            //  so the only configuration things are 
            //  what actor it is 
            let params = currentLine.split(":");
            //  if we get the actor name 
            if(params[0] == "actor"){
                console.log("Asdasd", params[1])
                actorName = params[1];
            }
            //  actor racks that are supported 
            if(params[0] == "actorTrack"){
                // create a new track if its supported 
                //  this is for backwards comapadibility so dont 
                //  reall need it until i gues cucker workring

                actorTracks.get("tracks").set(params[1],[]);
            }
            //  we can put what other tracks are there i guess like 
            //  pose 
            currentLine = scriptLines.shift();
        }
        //  copy the word array 
        let words = [... alignFile.words];
        while(currentLine != "[bodyEnd]"){
        //  we are in the body, loop until we get to [endbody]
            //  do the line parser where i needs to keep track of 
            //  the list of words and give them time stamps 
            
            this.parseLine(currentLine,words);
            
            currentLine = scriptLines.shift();
        }



        //  when we are done we should load the background 
         
        //  for now its just going to be background png 
        //  an await promise with the duration of the film
        this.rootScene.addFrameRange("background.png",
            [0,this.durationInMilliseconds]);
        
        //  then load in the objects (for now there is none)
        

        //  load in the desk 
        this.rootScene.addNewSubSceenObject(
            new SceneObject(this.projectFolder,'projects','desk.png'),
            new StaticPositiontable(0,1080,"bottom-left")
        )


        //  then load in any actors TODO is parse the mouth track for sure
        let actor = createActor(actorName,actorTracks);
        console.log(actor.subObjects)
        //  return an empty promise 
        this.rootScene.addNewSubSceenObject(actor,
                        new StaticPositiontable(325,182,"top-left"))
        console.log("done loading ")
        
    }
    //  will match the words form the current line to 
    //  words in the word list and also let us know 
    //  where any anotaitons we should keep track of 
    parseLine(currentLine: string, words: any[]) {
        //  lets get and then remove any <quese>
        //  (remeber the preceding word)


        //  do the same but for [] and instead of deleteing the whole thing,
        //  just delete the [   and  ] then it should be dope af 


         
    }
    async generateFrames() {
        //  make a temp frames files  
        let frameFolder = "./tempframes";
        rimraf.sync(frameFolder);
        mkdirSync(frameFolder, { recursive: true });

        //  figure out how many frames 
        //  then make a list of them based on how many render frames
        let numberOfFrames = (this.durationInMilliseconds / (1000/this.framePerSecond)); 
        console.log("number of frames",numberOfFrames)
        //  split up the workload here
        let promiseList:Promise<any>[] = []
        for(let i=0;i<this.numberOfRenderThreads;i++){
            //  need to make sure these are integers 
            let range = [
                1+(i * Math.round(numberOfFrames/this.numberOfRenderThreads)),
                ((i+1) * Math.round(numberOfFrames/this.numberOfRenderThreads))
            ]
            //  this is how we start a new process we call workers js 
            //  and then as a wrapper we want to use typescript
            promiseList.push(new Promise((ok,err)=>{
            const worker = new Worker('./src/worker.js', {
                workerData: {
                  path: './render.ts', //   the script that will render 
                  scene : this.rootScene,
                  framePerSecond : this.framePerSecond,
                  durationInMilliseconds : this.durationInMilliseconds,
                  frameRange : range,
                  frameFolder: frameFolder,
                    frameFilePadding: 8,
                }
              })
              //    if a thread console.logs anything
              worker.on('message', (result) => {
                console.log(result);
              });
              //    when the render is done 
              
                worker.on('exit', (result) => {
                    console.log(result);
                    console.log("rocess existsted")
                    ok(result)
                  });
              }));

              console.log(Worker)
              
        }

         
        try{
             
            await Promise.all(promiseList)
        }catch(e){
            console.log(e)
            
        }

        console.log("done")
        
       

         
         
        

        //  below is render code that works 
        //  so lets keep it that way and move it to the things 
        return;

        //  this is the main loop where we try to generate each frame 
        var frameTimeMilliseconds = 1000/this.framePerSecond;
        var frameNumber = 0;
        var frames = [];
        var currentTime = 0;
        while(currentTime < this.durationInMilliseconds){
            //let frameFilename = frameFolder + "/frame" + pad(frameNumber, this.frameFilePadding) + ".png";
            let frame = await this.rootScene.getObjectFrameAtTime(currentTime)
            //  write the frame
            //frame.write(frameFilename);

            //  modify the time thing here 
            currentTime = currentTime + frameTimeMilliseconds;
            frameNumber ++;
            console.log(frameNumber)
        }
    }
    findImages() {
        throw new Error("Method not implemented.");
    }
    async generateProjectVideo(){
        var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        var ffmpeg = require('fluent-ffmpeg');
        ffmpeg.setFfmpegPath(ffmpegPath);
        var command = ffmpeg();
        command.input('./tempframes/frame%0'+this.frameFilePadding+'d.png')
        .inputFPS(30)
        .output('output.mp4')
        .outputFPS(30)
        //.noAudio()
        .input('./projects/'+this.projectFolder+'/voice.mp3')
        .run();
        console.log("done")
    }

}

