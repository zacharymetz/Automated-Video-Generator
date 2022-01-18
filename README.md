# Automated-Video-Generator
This project makes videos automatically based on a script and audio of you reading that script. It has a library of characters with different actions, emotions and mouth shapes. It will even search the internet for relevant background images so you don't have to supply them at all. 
To determine when certain sounds are said for mouth animations we use an open source library called "lower quality" that uses a neural network.
To speed up image generation since js is single threaded, it uses a bunch of sub-processes that run worker code to make each frame faster.



## Example 1 testRant

Test rant is the largest video that this code has ever produced. 

To run you'll have to have ffmpeg installed on your local machine and then run the following commands: 
```
yarn install 

yarn start 
```
( it will take quite a bit of time , the result is also hosted at : ) 


