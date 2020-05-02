var Scraper = require('images-scraper');
 


//  here we find 
export async function getImagesFromTopicList(topicList:string[],saveFolder:string):Promise<any[]>{
    const google = new Scraper({
        puppeteer: {
          headless: true, //  run puppetter in the background 
        },
        tbs: {  // every possible tbs search option, some examples and more info: http://jwebnet.net/advancedgooglesearch.html
          isz: "l",  // options: l(arge), m(edium), i(cons), etc.
           
           
          sur: "f" // options: fmc (commercial reuse with modification), fc (commercial reuse), fm (noncommercial reuse with modification), f (noncommercial reuse)
        }, 
      });
       
    let imgs:string[] = [];
    for(let topic of topicList){
        var results = await google.scrape(topic, 1)[0];
        //  make an image name 

        //  construct the name so that it saves in the folder you pass though 
        let imageName:string = saveFolder + (new Date()).getTime() + ".extention";
        
        results.imageName = imageName;
        //  save the  image to the project forlder under /slidershow 
        saveImageToDisk(results.url,imageName)
        imgs.push(results);

        
         
         
    }
    //  for each of them we need to do this and lets do it in a promise so we can make async request 
   
    //  return the imgs so that we can make it into a render object 
    return imgs;
}

//  is function will save all the the images in their order to 
//  
var fs = require('fs');
var https = require('https');
//Node.js Function to save image from External URL.
function saveImageToDisk(url, localPath) {var fullUrl = url;
var file = fs.createWriteStream(localPath);
var request = https.get(url, function(response) {
response.pipe(file);
});
}