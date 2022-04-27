import youtubedl from 'youtube-dl-exec';
import * as yt from 'youtube-search-without-api-key';
import https from 'https';
import fs from 'fs';

import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import shell from 'shelljs';

//'https://www.youtube.com/watch?v=WibcvWT7KQQ'
const fetchYoutubeAudio = async (url) => {
    return youtubedl(url, {
    dumpSingleJson: true,
    noWarnings: true,
    noCallHome: true,
    noCheckCertificate: true,
    preferFreeFormats: true,
    youtubeSkipDashManifest: true,
    format: 'bestaudio/best',
    }).then(async output => {
        // Get first 4 words of title and remove special characters
        var title = output.title.split(' ').slice(0, 4).join(' ').replace(/[^a-zA-Z0-9 ]/g, '');
        output.formats.forEach(format => {
            var stramarray =[];
            if(format.format.indexOf('audio only') > -1) {                
                stramarray.push(format);
                // var file = fs.createWriteStream(format.format+".wav");
                // var request = https.get(format.url, function(response) {
                //     response.pipe(file);
                // });
            }

        });
        
        await downloadFile(output.formats[0].url, title+".wav").then(() => {
            console.log('done');
        });
    })
}
function printSize(bytes) {
    let output = bytes;
    let steps = 0;

    var units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];

    while (output > 1024) {
        output /= 1024;
        steps++;
    }

    return parseFloat(output).toFixed(2) + " " + units[steps];
}
const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const memoryUsage = [0];
        let progress = 0;
        const file = fs.createWriteStream(dest);
        const request = https.get(url, response => {
            const size = Number(response.headers['content-length']);
            //response.pipe(file);
            response.on('data', data => {
                file.write(data);
        
                progress += Buffer.byteLength(data);
                process.stdout.write("\r" + Math.floor((progress / size * 100)) + "%");
        
                memoryUsage.push(process.memoryUsage().heapUsed);
            });
            file;
            response.on('end', function() {
                file.close();
        
                const avg = memoryUsage.reduce((a, i) => a + i) / memoryUsage.length;
                const max = Math.max(...memoryUsage);
                const min = Math.min(...memoryUsage);
        
                console.log("\n Memory Usage Statistics for", printSize(size));
                console.log("Avg:", printSize(avg), "Max:", printSize(max), "Min:", printSize(min));
            });
            // file.on('finish', () => {
            //     file.close(resolve(dest));
            // });
        });
        request.on('error', reject);
        request.end();
    });
};
//fetchYoutubeAudio('https://www.youtube.com/watch?v=WibcvWT7KQQ');
function showDownloadingProgress(received, total) {

    var percentage = ((received * 100) / total).toFixed(2);
    console.log("\r");
    console.log(percentage + "% | " + received + " bytes downloaded out of " + total + " bytes.");
}

const searchSongQuestion = async () => {
    const questions = 
    {
      name: "SEARCH",
      type: "input",
      message: "What Song are you searching for? (press q to quit)"
    };
    return inquirer.prompt(questions).then(searchSongAnswer);
}
const searchSongAnswer = async (answers) => {
    
    if(answers.SEARCH !== 'q') {
        const videos = await yt.search(answers.SEARCH, { maxResults: 5 });
        //console.log(videos);
        var myserach = [];
        //only get the first 5 videos
        for(var i = 0; i < 5; i++) {
            myserach.push(videos[i]);
        }
        var choices = myserach

        return whichSongQuestion(myserach);
    }else{
        Finished();
    }
    
}

const whichSongQuestion = async (videos) => {
    var newQuestions = {
        name: "SONG",
        type: "list",
        message: "Which song do you want to download?",
        choices: videos.map(video => video.title).concat(['Search Again'])
    };
    var answer =await  inquirer.prompt(newQuestions);
    whichSongAnswer(answer,videos)
}
const whichSongAnswer = async (newnswer,videos) => {
    
    if(newnswer.SONG !== 'Search Again') {
        var myvideo = videos.find(video => video.title === newnswer.SONG);    
        await fetchYoutubeAudio(myvideo.url);        
    }
    return searchSongQuestion();
}
const askQuestions = () => {
    return searchSongQuestion();
};

const Finished = () => {
    console.log(
        chalk.white.bgGreen.bold(`Done!`)
    );
};
  

const init = () => {
    console.log(
      chalk.green(
        figlet.textSync("Download Youtube audio", {
          font: "Ghost",
          horizontalLayout: "default",
          verticalLayout: "default"
        })
      )
    );
  }
const run = async () => {
    // show script introduction
    init();
    // ask questions
    const answers = await askQuestions();    
    // create the file
    //const filePath = createFile(FILENAME, EXTENSION);
    // show success message
};
  
run();