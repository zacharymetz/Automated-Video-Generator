var fs = require('fs');



const vowelMap ={
'm' :"./test/m_p_b.png",
'ow' :"./test/ooh_r.png",
'b' :"./test/m_p_b.png",
'ah' :"./test/ah_eh_ih.png",
'l' :"./test/y_l.png",
'iy' :"./test/ah_eh_ih.png",
'w' :"./test/d_g_k.png",
'z' :"./test/d_g_k.png", 
'ih' :"./test/ah_eh_ih.png", 
'n' :"./test/d_g_k.png", 
'sh' :"./test/d_g_k.png", 
'r' :"./test/ooh_r.png",
's' :"./test/d_g_k.png", 
't' :"./test/d_g_k.png",
'aa' :"./test/ah_eh_ih.png",
'jh' :"./test/d_g_k.png",
'ae' :"./test/ah_eh_ih.png",
'y' :"./test/y_l.png",
'uw' :"./test/ooh_r.png",
'eh' :"./test/ah_eh_ih.png",
'oov' :"./test/ooh_r.png",
'd' :"./test/d_g_k.png",
'ey' :"./test/ah_eh_ih.png",
'er' :"./test/d_g_k.png",
'k' :"./test/d_g_k.png",
'f' :"./test/f_v.png", 
'ay' :"./test/ah_eh_ih.png", 
'ng' :"./test/d_g_k.png",
'ch' :"./test/d_g_k.png",
'dh' :"./test/d_g_k.png",
'p' :"./test/m_p_b.png", 
'v' :"./test/f_v.png",
'ao' :"./test/ah_eh_ih.png",
'g' :"./test/d_g_k.png"

}










async function main(){
    //  read the file 
    var contents = JSON.parse(fs.readFileSync('./testPopAlign.json', 'utf8'));
    // for each word
    var phoneFrames = new FrameTable();
    for(let i in contents.words){
        let word = contents.words[i];
        //  set the start of the phone chain to the word start 
        let startMilisecond =(word.start) * 1000;

        for(let j in word.phones){
            let phone = word.phones[j];
            //  generate an miliseonds range for the time the 
            //  phenom is 
            let myStartMilisecond = startMilisecond;
            let myEndMiliseonds = myStartMilisecond + (phone.duration * 1000);
            phoneFrames.add(
                vowelMap[phone.phone.split("_")[0]]
                ,[myStartMilisecond,myEndMiliseonds]
            );
            //  after we push a frame then we need to set the start to 
            //  this guys end since its in the word 
            startMilisecond = myEndMiliseonds;




        }

        //  so now lets do a check to see if the stuff lines up 
        //console.log("Does this match",(word.end) * 1000,startMilisecond)



    }


    var frames = writeTestFrames(phoneFrames, "./testFrames/",30);

        //  get the start time and figure out 
        //  get the start for each "letter ish thing"
        //  add it to a list with the millisoncd start and what image file 
}




function writeTestFrames(frameTable,folder,fps){
    
    //  first get how much time in ms each frame is 
    var frameTimeMilliseconds = 1000/fps;
    //console.log(frameTimeMilliseconds)
   
    var frameNumber = 0;
    var frames = [];
    var currentTime = 0;
    while(currentTime < frameTable.getTotalDuration()){
        //  get the image we need at that time here
        let image = frameTable.getImageAtTime(currentTime);
        console.log(image)
        if(!image){
            image = "./test/base.png";
        }
        
        
        
        var fileName = folder + "frame" + pad(frameNumber) + ".png";
            //  since we arent doing anything cool with the frames yet 
            //  we need to make them into a a folder and name it 
            
            fs.copyFile(image, fileName, (err) => {
                if (err) throw err;
                
              });


            frames.push(fileName)
        currentTime = currentTime + frameTimeMilliseconds;
        frameNumber ++;
    }
    
    return frames;

}
function pad(number){
    var numberString = number.toString();
    while(numberString.length < 8){
        numberString = "0" + numberString;
    }
    return numberString;
}


function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}










/**
 * so this is a list where we pack frames regardless of where they are
 * then we can ask it to iterate and find something 
 * 
 * this will be expaneded later to handle the character thigns
 * and be exabable, its more a character table but later in type script 
 */
class FrameTable{
    constructor(){
        //  internal list of frames 
        //  ordered by the frame range
        this.frameList = [];
        this.baseImage = "./test/base.png";
        
    }
    add(imageSrc, frameRange){
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
    getImageAtTime(t){
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

    getTotalDuration(){
        //  will get the last frame and the end range 
        //  for the ammount of frames we need to draw for the 
        //  guy 
        //console.log(this.frameList[this.frameList.length -1].rangeEnd)
        return this.frameList[this.frameList.length -1].rangeEnd;
    }

}











main();

