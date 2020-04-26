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
    var contents = JSON.parse(fs.readFileSync('./align.json', 'utf8'));
    var uniquePhones = [{
        image : "./test/base.png",
        startTime : 0,
         
    }]
    // for each word 
    for(let word of contents.words){
        
        //  that is a list of phones 
        var start = word.start * 1000;
        var currentDuration = 0
        if(word.phones){
            for(let phone of word.phones){
                //console.log(phone.phone.split("_")[0], currentDuration + start);;
                
                uniquePhones.push({
                    image : vowelMap[phone.phone.split("_")[0]],
                    startTime : (currentDuration + start) ,
                    duration : phone.duration * 1000
                });
                currentDuration = currentDuration + (phone.duration * 1000)
            }
            //  at the end of the word there should be some dead space tbh 
            
            //  if the end of the word is longer than the duration plus start then its good 
            if((word.end * 1000) > (currentDuration + start) ){
                //  add the blan for the time
                let  remaining = (word.end * 1000) - (currentDuration + start);
                console.log(  (currentDuration + start), remaining) 
                
                uniquePhones.push({
                    image : "./test/base.png",
                    startTime : (currentDuration + start) ,
                    duration : remaining
                });
            }
        }
        
    }uniquePhones[0].duration = uniquePhones[1].startTime
    //console.log(uniquePhones)
    var frames = writeTestFrames(uniquePhones, "./testFrames/",30);

        //  get the start time and figure out 
        //  get the start for each "letter ish thing"
        //  add it to a list with the millisoncd start and what image file 
}




function writeTestFrames(frameTable,folder,fps){
    
    //  first get how much time in ms each frame is 
    var frameTimeMilliseconds = 1000/fps;
    console.log(frameTimeMilliseconds)
    var currentFrameTime = 0;
    var frameNumber = 0;
    var frames = [];
    for(let frame of frameTable){
        var frameEndTime = currentFrameTime + frame.duration;
         
        //  while i have frame left to make 
        while(frame.duration > 0 ){
             
            
            var fileName = folder + "frame" + pad(frameNumber) + ".png";
            //  since we arent doing anything cool with the frames yet 
            //  we need to make them into a a folder and name it 
            
            fs.copyFile(frame.image, fileName, (err) => {
                if (err) throw err;
                
              });


            frames.push(fileName)
            frameNumber++;  //  increment this 
            frame.duration = frame.duration - frameTimeMilliseconds;
        }
        
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
main();