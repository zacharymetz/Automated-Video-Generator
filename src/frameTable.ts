
var fs = require('fs');

import { readFileSync } from 'fs';
import * as Jimp from 'jimp';
import { SceneObject } from './scene';


 

/**
 * so this is a list where we pack frames regardless of where they are
 * then we can ask it to iterate and find something 
 * 
 * this will be expaneded later to handle the character thigns
 * and be exabable, its more a character table but later in type script 
 */
export class FrameTable{
    frameList: any[];
    baseImage: string;
    constructor(baseImage){
        //  internal list of frames 
        //  ordered by the frame range

        //  for later we can add more frame stuff 
        this.frameList = [];
        this.baseImage = baseImage;

        
    }
    add(imageSrc, frameRange):void{
        //  console.log(imageSrc)
        //  add it to the list 
        this.frameList.push({
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
        for(let frame of this.frameList){
            if(t >= frame.rangeStart && t <= frame.rangeEnd ){
                return frame.image;
            }
        }
        
        //  if we do not have a frame for the range we can 
        //  just return the base image for the thing 
        return this.baseImage;

    }


}

/**
 * will create a frame table object from a saved frame table 
 * this was meant to offer multithreading to the render game 
 * 
 * @param rawFrameTable a transmitted frametable
 */
export function recreateFrameTableFrom(sceneObject:SceneObject,rawFrameTable:any){
    //  creat the fram table 
    
    //  loop though and add all the frames 
    for(let frame of rawFrameTable.frameList){
        let img:string = frame.image;
        let frameRame:number[] = [frame.rangeStart,frame.rangeEnd]
        sceneObject.addFrameRange(img,frameRame)
         
    }
    
   
}