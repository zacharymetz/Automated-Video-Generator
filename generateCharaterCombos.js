var base = "./testPope/base.png"
var testMouth = "./testPope/ah_eh_ih.png"
var mouths = [
    "./testPope/ah_eh_ih.png",
    "./testPope/d_g_k_th.png",
    "./testPope/f_v.png",
    "./testPope/m_p_b.png",
    "./testPope/ooh_r.png",
    "./testPope/y_l.png"
]
var Jimp = require('jimp');
function addMouthToCharacter(mouthPath,saveFolder){
    Jimp.read(base, (err, character) => {
        Jimp.read(mouthPath, (err, mouth) => {

            //  lets do some math so we can figure out to put the mouth in the 
            //  eact middle of the space 
            var middleX = 200 - (mouth.bitmap.width / 2)
            var middleY = 450 - (mouth.bitmap.height / 2)
            if (err) throw err;
            character
            .composite( mouth, middleX, middleY )
            .write(saveFolder+mouthPath.split('/')[mouthPath.split('/').length-1]); // save
        });
        
      });
}

for(let mouth of mouths){
    addMouthToCharacter(mouth,"./test/");
}


