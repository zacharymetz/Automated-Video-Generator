
var fs = require('fs');

import { readFileSync } from 'fs';
import * as Jimp from 'jimp';


/**
 * this object is the character and all of their 
 * frame posisitons over time 
 */
export class Actor{
    name:string;
    phoneticFrameTable:FrameTable;
    /**
     * 
     * @param name the folder name where all the assest are stored
     */
    constructor(name){

        this.name = name;
        this.phoneticFrameTable = new FrameTable();


        
    }


    
    /**
     *  Loads the phonetic data in from the align 
     * @param words 
     */
    loadPhoneticInfo(words){
        //  mi guess we can just assume that the character 
        //  image exists 


        //  load the time seired data
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
                this.phoneticFrameTable.add(
                    vowelMap[phone.phone.split("_")[0]]
                    ,[myStartMilisecond,myEndMiliseonds]
                );
                //  after we push a frame then we need to set the start to 
                //  this guys end since its in the word 
                startMilisecond = myEndMiliseonds;
            }
        }
 
    }


    async getCharacterFrameAtTime(t:number):Promise<Jimp>{
        //  get the location of the actor assets 
        let actorFolder = "./actors/"+this.name + "/";

        //  get the proper character pose (right now its just the base 
        //  image)
        let characterPose = "base.png";
        
        
        //  for the frame get the phonitic info for the time 
        let phoneticIdentityer = this.phoneticFrameTable.getImageAtTime(t);
        console.log(actorFolder + phoneticIdentityer)
        //  so now lets get combine the images with a promise  
        var character = await new Promise<Jimp>((ok,reject)=>{
            Jimp.read(actorFolder + characterPose, (err, character) => {
                if(characterPose === phoneticIdentityer){
                    ok(character)
                }else{
                    Jimp.read(actorFolder + phoneticIdentityer, (err, mouth) => {
        
                        //  lets do some math so we can figure out to put the mouth in the 
                        //  eact middle of the space 
                        var middleX = 200 - (mouth.bitmap.width / 2)
                        var middleY = 450 - (mouth.bitmap.height / 2)
                        if (err) throw err;
                        //  make sure to return the promise with an okey
                        ok(character.composite( mouth, middleX, middleY ))
                         
                    });
                }
            });
        });
        //  we want to return the character so it can be use by the preformance 
        //  hoever it wants 
        return character;
    }
}






 

/**
 * so this is a list where we pack frames regardless of where they are
 * then we can ask it to iterate and find something 
 * 
 * this will be expaneded later to handle the character thigns
 * and be exabable, its more a character table but later in type script 
 */
class FrameTable{
    phoneticFrameList: any[];
    baseImage: string;
    constructor(){
        //  internal list of frames 
        //  ordered by the frame range

        //  for later we can add more frame stuff 
        this.phoneticFrameList = [];
        this.baseImage = "base.png";

        
    }
    add(imageSrc, frameRange):void{
        //  console.log(imageSrc)
        //  add it to the list 
        this.phoneticFrameList.push({
            rangeStart : frameRange[0],
            rangeEnd : frameRange[1],
            image : imageSrc
        });

        //  make sure the order of the list 
        //  is maintained based on something 

    }

    //  time in miliseconds that you 
    //  want the frame 
    getImageAtTime(t:number):string{
        //  loop thought the frame list until we find one that i am 
        //  in the range of 
        for(let frame of this.phoneticFrameList){
            if(t >= frame.rangeStart && t <= frame.rangeEnd ){
                return frame.image;
            }
        }
        
        //  if we do not have a frame for the range we can 
        //  just return the base image for the thing 
        return this.baseImage;

    }


}



//  this vowel map for which sound to image i guess 
//  it is loaded in when the phenomic table is loaded in 
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