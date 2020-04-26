
function generateVideo(){
    var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    var ffmpeg = require('fluent-ffmpeg');
    ffmpeg.setFfmpegPath(ffmpegPath);
    var command = ffmpeg();
    command.input('./testFrames/frame%08d.png')
    .inputFPS(30)
    .output('testaddress.mp4')
    .outputFPS(30)
    //.noAudio()
    .input('testpope.mp3')
    .run();
}
generateVideo()