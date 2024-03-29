

//  holds the differn scene objects and renders 
//  all of them and take care of the placement of the scene 

import { FrameTable } from "./frameTable";
import Jimp = require("jimp");
import { readFileSync, mkdirSync } from "fs";
 
import {recreateFrameTableFrom} from './frameTable';
import { ChangeStart } from "./project";
import { getImagesFromTopicList } from "./imageRetriver";


export class SceneObject{
    name:string;
    frameTable:FrameTable;  //  visual 
    
    subObjects:SceneObjectListElement[]; //  list of sub ones on this 
    
    //  these idenifierers down here are for
    //  locating the images and what not 
    assestFolder:string;

    constructor(name,assetFolder,baseImage){
        this.name = name;
        this.assestFolder = assetFolder;
        this.frameTable = new FrameTable(baseImage);
        this.subObjects = [];

    }
    //  add a new one, the order of precendeds wont matter till
    //  later
    addNewSubSceenObject(subObject:SceneObject,positionTable:PositionTable){
        this.subObjects.push({
            sceneObject:subObject,
            positionTable:positionTable
        });

    }
    addFrameRange(image:string,duration:number[]){
       //   add it to the interal frame table 
        this.frameTable.add(image,duration);
       
    }
    async getObjectFrameAtTime(t:number):Promise<Jimp>{
        
        // check to see if there is a sub image we should load 
        if(this.frameTable.getImageAtTime(t) == null){
            return null;
        }


        //  lets get the image for the frame we are at 
        //  and produce a uri for it so that it 
        //  can be loaded
        //  alright need to find the image file then it should be 
        //  good 
        
        let folder:string = './'+this.assestFolder+'/'+this.name+"/" + this.frameTable.getImageAtTime(t); 
         
        return await new Promise<Jimp>((ok,reject)=>{
            //  alight he we want to use the frame thing to get 
            //  the timage for us, that means we need to store 
            //  the root or something somewhere 
             
            Jimp.read(folder, async (err, baseImage) => {
                //  make sure to pass the error up the chain
                if(err) reject(err);

                //  after the image is read then 
                for(let i in this.subObjects){
                    console.log("subObject :",this.frameTable.getImageAtTime(t),folder)
                    try{
                        //  let the object deal with it self if it needs something 
                        //  that way we can nest things as deep as we want 
                        let subImage = await this.subObjects[i].sceneObject.getObjectFrameAtTime(t);
                        
                        let position = await this.subObjects[i].positionTable.getPosistionAtTime(t);
                        
                        if(subImage){
                            //  based on the anchor we need to do stuff 

                            //  default the anchor is the top left coner 
                            let x = position.x;
                            let y = position.y;
                            
                            //  set the anchor to center 
                             
                            if(position.anchor == "center"){
                                x = position.x - (subImage.bitmap.width/2);
                                y = position.y - (subImage.bitmap.height/2);
                            } if(position.anchor == "bottom-left"){
                                y = y - (subImage.bitmap.height);
                            }

                            
                            
                            //  compose the images here 
                            baseImage.composite( subImage, x, y )
                        }
                        
                    
                    }catch(e){
                        //  make sure to catch the error from 
                        //  the thing above 
                         
                        reject(e);
                    }
                    
                }


                //  after its all done we okay the base image so what ever
                //  called this can do what it wants with it 
                ok(baseImage);
            });
        });
    }
}

interface SceneObjectListElement{
    sceneObject:SceneObject;
    positionTable:PositionTable;
}


// will create an actor form the list of elements 
export function createActor(name:string,subTracks:Map<string,any>,totalProjectDuration:number):SceneObject{
    //  so we need a configusation file with the actor now
    let actorConfig:any = JSON.parse( readFileSync('./actors/'+name+'/config.json', 'utf8'));


    //  make the main actor 
     
    let actor = new SceneObject(name,'actors','base.png');

    //  lets get the mouth track
    if(subTracks.has("words"))
    {
        //  here we will have to do something about the up and down thing 

        let words = subTracks.get("words") ;
        //  okay so this is the phonetic one 
        let mouthTrack = new SceneObject(name,'actors',null);
        //  load in the proper frames to the scene object 
        for(let i in words){
            let word = words[i];
            //  set the start of the phone chain to the word start 
            let startMilisecond =(word.start) * 1000;

            for(let j in word.phones){
                let phone = word.phones[j];
                //  generate an miliseonds range for the time the 
                //  phenom is 
                let myStartMilisecond = startMilisecond;
                let myEndMiliseonds = myStartMilisecond + (phone.duration * 1000);
                mouthTrack.addFrameRange(
                    vowelMap[phone.phone.split("_")[0]]
                    ,[myStartMilisecond,myEndMiliseonds]
                );
                //  after we push a frame then we need to set the start to 
                //  this guys end since its in the word 
                startMilisecond = myEndMiliseonds;
            }
        }

        let mouthPosition = new StaticPositiontable(actorConfig.mouth.x,actorConfig.mouth.y,actorConfig.mouth.anchor);
        //  for the position table add a frame to offset based on 
        //  the actor configuration file 
        actor.addNewSubSceenObject(mouthTrack,mouthPosition)
    }
    //  the eyes tracks
    if(subTracks.has("eyes"))
    {
        //  for now lets just add a static things with a base images 
        let eyetrack = new SceneObject(name,'actors','eyes_angry.png');
        //  here is where we can do the same thing we do in the themes thing for the eyes 
        let eyeChanges:ChangeStart[]  = subTracks.get("eyes");
        for(let i=0;i<eyeChanges.length;i++){
            
            let endingTime:number = totalProjectDuration;
            if(i < (eyeChanges.length - 1)){
                endingTime = eyeChanges[i + 1].startTime * 1000
            }
            
            let startTime:number = eyeChanges[i].startTime * 1000;
            let imgSrc:string = "eyes_"+ eyeChanges[i].key + ".png"; 
            console.log("adding a new eye track",imgSrc,[startTime,endingTime],"\n\n\n\n\n\n\n\n")
            eyetrack.addFrameRange(imgSrc,[startTime,endingTime]);
        }
        
        actor.addNewSubSceenObject(
            eyetrack,
            new StaticPositiontable(actorConfig.eyes.x,actorConfig.eyes.y,actorConfig.eyes.anchor)
        );
    }
    //  if it has a pose track
    if(subTracks.has("pose"))
    {
        let poseChanges:ChangeStart[]  = subTracks.get("pose");
        for(let i=0;i<poseChanges.length;i++){
            let endingTime:number = totalProjectDuration;
            if(i < (poseChanges.length - 1)){
                endingTime = poseChanges[i + 1].startTime * 1000
            }
            
            let startTime:number = poseChanges[i].startTime * 1000;
            let imgSrc:string = poseChanges[i].key + ".png"; 
            console.log("adding a new pose track",imgSrc,[startTime,endingTime],"\n\n\n\n\n\n\n\n")
            actor.addFrameRange(imgSrc,[startTime,endingTime])
        }
        
    }

    //  load the pose and eye data from the main thing ??? or from where 
    //  should load it in via the thing above 
    return actor;

}


export async function createSlideShowObject(name:string,topicList:ChangeStart[],defaultImage:string, totalProjectDuration,width:number,height:number):Promise<SceneObject>{
    
    //  first lets use the google image scaper and get all the images we need for this 
    let imgFolder:string = "./projects/"+name+"/slideshow/";
    //  make the folde 
    mkdirSync(imgFolder, { recursive: true });
    //  pass it to the function that will go and get all the iamges and save it to 
    //  the folder 
    //TODO change what name this saves its as 
    var imgList = await  getImagesFromTopicList(topicList.map(x=>x.key),imgFolder,width,height);

    //  here we need to calcualte the durations 
    for(let i=0; i<topicList.length;i++){
        let endingTime:number;
        if(i == (topicList.length - 1)){
            endingTime = totalProjectDuration;
        }else{
            endingTime =topicList[i+1].startTime;
        }
        topicList[i].duration = endingTime - topicList[i].startTime;
    }
 
    
    //  then we can make the slide show object 
    //  the assest folder will be the project and the name is the name of the 
    //  project so the base image can be put in there 
    let slideShowObject = new SceneObject(name,"projects",defaultImage);

    //  now use the track i passed thought to come up with when 
    //  i should show each image and its position 
    //  should also do some cropping with the dimentions that i pass thouhg 
    let currentTime:number = 0;
    for(let i=0; i < topicList.length;i++){
        //  we want to add from curren time to this time 
        console.log("this is the img list", imgList[i])
        let imageSrc:string = imgList[i].imageName;
        slideShowObject.addFrameRange(
            imageSrc,
            [topicList[i].startTime * 1000,(topicList[i].startTime +topicList[i].duration) * 1000]
        );
        //  then set current time 
        
    }

    return slideShowObject;
}







//  like the frame table but will track position over time 
//  all i needs to do is accept key frames and parameters 
//  for the motion and ruten that 
//  it will also handle other translation things 
export class PositionTable{
    positionList: any[];
    static:boolean;
    constructor(){
        this.static = false
        this.positionList = [];

    }

    addPosition(offset:Position,range:number[],anchor:string="center"){
        //  do the same is as the other thing but 
        //  if we only get one number in the range we 
        //  
    }
    getPosistionAtTime(t:number):Position{
        return {
            x :0,
            y : 0,
            anchor:"center"
        }
    }
}

//  so this is like a position table 
//  but the thing will stay at the same postion the whole time 
//  it just overloads the  position table so it can be 
//  used in its palce 
export class StaticPositiontable extends PositionTable{
    x:number;
    y:number;
    anchor:string;
    static:boolean;
    constructor(x:number,y:number, anchor:string){
        super();
        this.x = x;
        this.y =y;
        this.anchor = anchor;
        this.static = true;
    }
    getPosistionAtTime(t:number):Position{
        return {
            x :this.x,
            y : this.y,
            anchor:this.anchor
        }
    }
}


interface Position{
    x:number;
    y:number;
    anchor:string;
}


export function recreatePositionTableFrom(positionTable:any):PositionTable{
    
    //  lets see if its a static one or not 
    if(positionTable.static){
        //  
        let x:number = positionTable.x
        let y:number = positionTable.y
        let anchor:string = positionTable.anchor
        let newPositionTable = new StaticPositiontable(
            x,
            y,
            anchor
        );
        return newPositionTable;

    }else{
        let newPositionTable = new PositionTable();
        //  now we can loop through and migrate the 
        //  positions 
        return newPositionTable
    }
    
}


export function  reconstructSceneObjects(oldSceneObject:any):SceneObject{
    console.log("this is the old scene",oldSceneObject.name,oldSceneObject.frameTable.baseImage)
    //  will create and do back 
    let name:string = oldSceneObject.name;
    let assestFolder:string = oldSceneObject.assestFolder;
    let baseImage:string = oldSceneObject.frameTable.baseImage;
    let sceneObject = new SceneObject(name,assestFolder,baseImage);
    //  make sure we can recreate the frame table 
   
    let frameTable = oldSceneObject.frameTable;

    recreateFrameTableFrom(sceneObject,frameTable)
    //  for each sub object 
    for(let subObject of oldSceneObject.subObjects){
        //  call the reconstruc objects thing 
        //  recreate the position table for them
        sceneObject.addNewSubSceenObject(
            reconstructSceneObjects(subObject.sceneObject),
            recreatePositionTableFrom(subObject.positionTable)
        )
         
    }
    console.log("here is the parced Scene ", sceneObject)
         


    return sceneObject;

}






const vowelMap ={
    'm' :"m_p_b.png",
    'ow' :"ooh_r.png",
    'b' :"m_p_b.png",
    'ah' :"ah_eh_ih.png",
    'l' :"y_l.png",
    'iy' :"ah_eh_ih.png",
    'w' :"d_g_k.png",
    'z' :"d_g_k.png", 
    'ih' :"ah_eh_ih.png", 
    'n' :"d_g_k.png", 
    'sh' :"d_g_k.png", 
    'r' :"ooh_r.png",
    's' :"d_g_k.png", 
    't' :"d_g_k.png",
    'aa' :"ah_eh_ih.png",
    'jh' :"d_g_k.png",
    'ae' :"ah_eh_ih.png",
    'y' :"y_l.png",
    'uw' :"ooh_r.png",
    'eh' :"ah_eh_ih.png",
    'oov' :"ooh_r.png",
    'd' :"d_g_k.png",
    'ey' :"ah_eh_ih.png",
    'er' :"d_g_k.png",
    'k' :"d_g_k.png",
    'f' :"f_v.png", 
    'ay' :"ah_eh_ih.png", 
    'ng' :"d_g_k.png",
    'ch' :"d_g_k.png",
    'dh' :"d_g_k.png",
    'p' :"m_p_b.png", 
    'v' :"f_v.png",
    'ao' :"ah_eh_ih.png",
    'g' :"d_g_k.png"
}
const downVowelMap ={
    'm' :"m_p_b_down.png",
    'ow' :"ooh_r.png",
    'b' :"m_p_b_down.png",
    'ah' :"ah_eh_ih_down.png",
    'l' :"y_l_down.png",
    'iy' :"ah_eh_ih_down.png",
    'w' :"d_g_k_down.png",
    'z' :"d_g_k_down.png", 
    'ih' :"ah_eh_ih_down.png", 
    'n' :"d_g_k_down.png", 
    'sh' :"d_g_k_down.png", 
    'r' :"ooh_r.png",
    's' :"d_g_k_down.png", 
    't' :"d_g_k_down.png",
    'aa' :"ah_eh_ih_down.png",
    'jh' :"d_g_k_down.png",
    'ae' :"ah_eh_ih_down.png",
    'y' :"y_l_down.png",
    'uw' :"ooh_r.png",
    'eh' :"ah_eh_ih_down.png",
    'oov' :"ooh_r.png",
    'd' :"d_g_k_down.png",
    'ey' :"ah_eh_ih_down.png",
    'er' :"d_g_k_down.png",
    'k' :"d_g_k_down.png",
    'f' :"f_v_down.png", 
    'ay' :"ah_eh_ih_down.png", 
    'ng' :"d_g_k_down.png",
    'ch' :"d_g_k_down.png",
    'dh' :"d_g_k_down.png",
    'p' :"m_p_b_down.png", 
    'v' :"f_v_down.png",
    'ao' :"ah_eh_ih_down.png",
    'g' :"d_g_k_down.png"
}