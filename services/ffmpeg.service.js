const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

function analyzeLoudness() {
  try {
    const folderPath = path.resolve(__dirname, "../files");
    const supportedExtensions = [".ogg", ".mp3", ".m4a", ".wav"];

    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error(`Unable to scan directory ${folderPath}`, err);
        return;
      }

      const audioFiles = files.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return supportedExtensions.includes(ext);
      });

      if (audioFiles.length === 0) {
        console.log("No audio files");
        return;
      }

      console.log(`Found ${audioFiles.length} audio files`);

      audioFiles.forEach((fileName) => {
        const resolvedpathName = path.resolve(folderPath, fileName);
        console.log(`Analyzing ${fileName}`);

        ffmpeg(resolvedpathName)
          .audioFilters("volumedetect")
          .on("end", (stdout, stderr) => {
            const loudnessMatch = stderr.match(/max_volume: (.*) dB/);
            const maxVolume = parseFloat(
              loudnessMatch ? loudnessMatch[1] : "0"
            );

            console.log(`\n----Analysis report-----`);
            console.log(`File: ${fileName}`);
            console.log(`max volume: ${maxVolume} dB`);

            if (maxVolume > -10) {
              console.log("Status: Operator is speaking loudly");
            } else {
              console.log("Status: Operator is not speaking loudly");
            }
            console.log("--------------------------------\n");
          })
          .on("error", (err) => {
            console.log(`Error analyzing ${fileName}`, err.message);
          })
          .save("output.mp3");
      });
    });

    // ffmpeg('https://cdn.pixabay.com/audio/2022/03/15/audio_9ccd97b6d6.mp3')
    //       .audioFilters("volumedetect")
    //       .on("end", (stdout, stderr) => {
    //         const loudnessMatch = stderr.match(/max_volume: (.*) dB/);
    //         const maxVolume = parseFloat(
    //           loudnessMatch ? loudnessMatch[1] : "0"
    //         );

    //         console.log(`\n----Analysis report-----`);
    //         console.log(`max volume: ${maxVolume} dB`);

    //         if (maxVolume > -10) {
    //           console.log("Status: Operator is speaking loudly");
    //         } else {
    //           console.log("Status: Operator is not speaking loudly");
    //         }
    //         console.log("--------------------------------\n");
    //       })
    //       .on("error", (err) => {
    //         console.log(`Error analyzing`, err.message);
    //       })
    //       .save("output.mp3");
    
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  analyzeLoudness,
};
