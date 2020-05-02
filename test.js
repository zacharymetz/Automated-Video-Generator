var Scraper = require('images-scraper');
 // this is how i can get the google images using puupeteer lmao 
const google = new Scraper({
  puppeteer: {
    headless: true, //  run puppetter in the background 
  },
  tbs: {  // every possible tbs search option, some examples and more info: http://jwebnet.net/advancedgooglesearch.html
    isz: "l",  // options: l(arge), m(edium), i(cons), etc.
     
     
    sur: "f" // options: fmc (commercial reuse with modification), fc (commercial reuse), fm (noncommercial reuse with modification), f (noncommercial reuse)
  }, 
});
 
(async () => {
  const results = await google.scrape('crisis', 1);
  console.log('results', results);
})();