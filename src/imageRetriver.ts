import Jimp = require("jimp/");

var Scraper = require('images-scraper');
 


//  here we find 
export async function getImagesFromTopicList(topicList:string[],saveFolder:string,height:number,width:number):Promise<any[]>{
    const google = new Scraper({
        puppeteer: {
          headless: false, //  run puppetter in the background 
        },
        tbs: {  // every possible tbs search option, some examples and more info: http://jwebnet.net/advancedgooglesearch.html
          isz: "l",  // options: l(arge), m(edium), i(cons), etc.
           
           
          //sur: "f" // options: fmc (commercial reuse with modification), fc (commercial reuse), fm (noncommercial reuse with modification), f (noncommercial reuse)
        }, 
      });
       
    let imgs:string[] = [];
    for(let topic of topicList){
        //  snag the first 10 results 
        var results = await google.scrape(topic, 1);
        console.log(results)
        //  make an image name 
        let result:any = {...results[0]}
        //  construct the name so that it saves in the folder you pass though 
        console.log(result.url)
        let imageName:string = saveFolder+ "original" + (new Date()).getTime() + "." + result.url.split(".")[result.url.split(".").length-1];
        imageName = imageName.split("?")[0];
        //  save the  image to the project forlder under /slidershow 
        //saveImageToDisk(result.url,imageName)
        console.log("image saved")

        console.log(imageName)
        let originalImage;
        let newImageUrl:string;
        let time = (new Date()).getTime().toString()
        try{
          originalImage = await Jimp.read(result.url);
          await originalImage.scaleToFit(width,height)
        
        //  save the image
         newImageUrl = saveFolder+ time + "." + result.url.split(".")[result.url.split(".").length-1];
        newImageUrl= newImageUrl.split("?")[0];
        await originalImage.writeAsync(newImageUrl);
        }catch(e){
          console.log(e)
        }
        

        //  so now we need to do some decison making about how to process the images 
        //  to make it fit in the width, height bounds 
        
          //  first lets make sure we can get the apect ratio to fit 

          //  then we resize it to the proper image
        
        //  hoever for now lets jsut resize it to fit 
        
        
        
        
        
        
        //  we will do some image processing before anything 
        let finalImageURI ="slideshow/"+ time + "." + result.url.split(".")[result.url.split(".").length-1];
        finalImageURI= finalImageURI.split("?")[0];
        result.imageName = finalImageURI;
        
        imgs.push(result);

        
         
         
    }
    //  for each of them we need to do this and lets do it in a promise so we can make async request 
   
    //  return the imgs so that we can make it into a render object 
    console.log(imgs)
    return imgs;
}

//  is function will save all the the images in their order to 
//  
var fs = require('fs');
var https = require('https');
//Node.js Function to save image from External URL.
function saveImageToDisk(url, localPath) {
  new Promise((ok)=>{
    var fullUrl = url;
    var file = fs.createWriteStream(localPath);
    var request = https.get(url, function(response) {
        response.pipe(file).on('close',()=>{
          setTimeout(()=>{
            ok(null)
          },10)
          
        })
        
    });
  });
    
}

