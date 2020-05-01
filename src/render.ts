import { parentPort, workerData } from 'worker_threads';
import { SceneObject, reconstructSceneObjects} from './scene'

function factorial(n: any): any {
  //console.log(3)
  new FrameRender(n.frameRange,
    n.scene,
    n.framePerSecond,
    n.durationInMilliseconds,
    n.frameFolder,
    n.frameFilePadding);
  return " "
}
 





//  when this is called it is just in the main direcotry so go maun 
class FrameRender{
  rootScene: SceneObject;
  frameRange: number[];
  framePerSecond: number;
  durationInMilliseconds: number;
  frameFolder: string;
  frameFilePadding: number;
  constructor(frameRange:number[],
    sceneObject:any,
    framePerSecond:number,
    durationInMilliseconds:number,
    frameFolder:string,
    frameFilePadding:number){
    //  okay so we need to ../////**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/***************************************************************************************----------------------------*---------------------------------------------------------------------------------------------0reconstruc all the scene objects and stuff
     
    //  then we need to start the render loop and render the frames we are 
    //  supposed to 
    this.frameRange = frameRange;
    this.rootScene  = reconstructSceneObjects(sceneObject);
    this.framePerSecond = framePerSecond;
    this.durationInMilliseconds = durationInMilliseconds;
    this.frameFolder = frameFolder;
    this.frameFilePadding= frameFilePadding
    //console.log(this)
    this.generateFrames();
  }
  async generateFrames(){
    
    //  instead of for every frame but for me frames 
    var frameTimeMilliseconds = 1000/this.framePerSecond;
        var frameNumber = this.frameRange[0];
        var frames = [];
        var currentTime = this.frameRange[0] * frameTimeMilliseconds;
        
        while(currentTime < this.durationInMilliseconds){
          //  make sure we dont over render
          if(this.frameRange[1] < frameNumber){
            break;
          }
          
          console.log("starting to render")
            let frameFilename = this.frameFolder + "/frame" + this.pad(frameNumber, this.frameFilePadding) + ".png";
            //console.log(frameFilename)
            
            try{
              
              let frame = await this.rootScene.getObjectFrameAtTime(currentTime)
              frame.write(frameFilename);
            }catch(e){
              console.log(e)
            }
            
            //  write the frame
            

            //  modify the time thing here 
            currentTime = currentTime + frameTimeMilliseconds;
            frameNumber ++;
            console.log("framenumber",frameNumber)
        }
  }
  pad(number:number, padding:number):string{
    var numberString = number.toString();
    while(numberString.length < padding){
        numberString = "0" + numberString;
    }
    return numberString;
  }
}
//  this is where we couple the stuff back 

 


parentPort.postMessage(
  factorial(workerData)
);
