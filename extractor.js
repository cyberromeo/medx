const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('C:\\Users\\psrih\\Downloads\\medx-2026\\src\\data\\subjects.js', 'utf8');

const startIndex = content.indexOf('export const videosBySubject = {');
if (startIndex !== -1) {
    let jsCode = content.slice(startIndex).replace('export const videosBySubject =', 'const videosBySubject =');
    
    // We can evaluate this by wrapping it or writing to a temp file
    jsCode += '\nmodule.exports = videosBySubject;';
    fs.writeFileSync('temp_eval.js', jsCode);
    
    const videosBySubject = require('./temp_eval.js');
    
    let result = '==================================================\nMedX 2026 - Complete YouTube Video Collection\n==================================================\n\n';
    let total = 0;
    let jsonVideos = [];
    
    for (const [key, subjectData] of Object.entries(videosBySubject)) {
        result += `## ${subjectData.title} (${subjectData.videos.length} videos)\n`;
        for (const video of subjectData.videos) {
            let url = video.videoUrl;
            // extract the video ID and make it a watch url
            const match = url.match(/embed\/([^?]+)/);
            let videoId = video.id;
            if (match) {
                videoId = match[1];
                url = `https://www.youtube.com/watch?v=${match[1]}`;
            }
            result += `  ${video.title}\n  ${url}\n\n`;
            jsonVideos.push({
                title: video.title,
                url: url,
                videoId: videoId,
                subject: subjectData.title
            });
            total++;
        }
        result += '\n';
    }
    result += `TOTAL: ${total} videos\n`;
    
    fs.writeFileSync('extracted_medx2026_videos.txt', result);
    fs.writeFileSync('extracted_medx2026_videos.json', JSON.stringify(jsonVideos, null, 2));
    
    // cleanup
    fs.unlinkSync('temp_eval.js');
    console.log(`Extracted ${total} videos to extracted_medx2026_videos.txt and extracted_medx2026_videos.json`);
} else {
    console.log("Could not find videosBySubject");
}
