var parser = require('xml2json');
var http = require('http');
var dateFormat = require('dateformat');
var fs = require('fs');
var CommandQueue = require("command-queue");
if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " YYYY-MM-DD");
    process.exit(-1);
}
 
var param = process.argv[2];
var sepline = "************************************************";
 
console.log(sepline);
console.log('Scan for feeds on or after: ' + param);
console.log(sepline + "\n");

http.get({
  hostname: 'internetradiopros.com',
  port: 80,
  path: '/revolutionary/feed.xml',
  agent: false  // create a new agent just for this one request
}, (res) => {
  // Do stuff with response
  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => rawData += chunk);
  res.on('end', () => {
    var cq = new CommandQueue();
    let parsedData =  JSON.parse(parser.toJson(rawData)).rss.channel.item;
    let podcastarr = parsedData.map(function(s) {
      return {
        filename: "videos/The Revolutionary Road Radio Show - " + dateFormat(new Date(s.pubDate),"yyyy-mm-dd") + ".webm",
        url: s.enclosure.url,
        pubDate: new Date(s.pubDate)
      };
    }).map(function(s) {
      return {
        filename: s.filename,
        url: s.url,
        pubDate: s.pubDate,
        ffmpeg: "ffmpeg -loop 1 -i '" + "videos/logo.jpg" + "' -i  '" + s.url + "' -shortest -c:v libvpx-vp9 -c:a libopus -threads 2 -tile-columns 1 -speed 2 -auto-alt-ref 1 -lag-in-frames 25 '" + s.filename + "'"
      };
    }).filter(function(s) {
      return !fs.existsSync(s.filename) && new Date(param) <= s.pubDate;
    }).forEach(function(s) {
      console.log(sepline);
      console.log("Adding Command: \n" + s.ffmpeg);
      console.log(sepline + "\n");
      cq = cq.sync(s.ffmpeg);
    });
    cq
    .run()
    .then(    
      function() {
        console.log('success');
      },
      function() {
        console.log('failure');
            
        // Close any remaining commands. 
        queue.close();
      }
    );
  }).on('error', (e) => {
    console.log(e.message);
  });
});




