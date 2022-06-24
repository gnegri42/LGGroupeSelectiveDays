const rp = require('request-promise-native');
const fs = require('fs');
const cheerio = require('cheerio');

const urls = [
    'https://lggroupe.com/vehicule/?vehicule=327882970244',
    'https://lggroupe.com/vehicule/?vehicule=355188040244',
    'https://lggroupe.com/vehicule/?vehicule=357601410244',
    'https://lggroupe.com/vehicule/?vehicule=349711360244',
    'https://lggroupe.com/vehicule/?vehicule=350040000244',
    'https://lggroupe.com/vehicule/?vehicule=353880730244',
    'https://lggroupe.com/vehicule/?vehicule=342737090244',
    'https://lggroupe.com/vehicule/?vehicule=352523590244',
    'https://lggroupe.com/vehicule/?vehicule=344089540244',
    'https://lggroupe.com/vehicule/?vehicule=357601020244',
    'https://lggroupe.com/vehicule/?vehicule=357601970244',
    'https://lggroupe.com/vehicule/?vehicule=355651360244',
    'https://lggroupe.com/vehicule/?vehicule=357602750244',
    'https://lggroupe.com/vehicule/?vehicule=357602250244',
]

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function downloadHtml(uri) {
    // the output filename
    const filename = 'result.html';

    // check if we already have the file
    // const fileExists = fs.existsSync(filename);
    // if (fileExists) {
    //     console.log(`Skipping download for ${uri} since ${filename} already exists.`);
    // return;
    // }

    // download the HTML from the web server
    // console.log(`Downloading HTML from ${uri}...`);
    const results = await rp({ uri: uri });
    // save the HTML to disk
    await fs.promises.writeFile(filename, results);
}

async function parsePage() {
    // console.log('Parsing box score HTML...');
    // the input filename
    const htmlFilename = 'result.html';
    // read the HTML from disk
    const html = await fs.promises.readFile(htmlFilename);
    // parse the HTML with Cheerio
    const $ = cheerio.load(html);
    // Get our rows
    const $trs = $('.container-vehicule');
    // console.log($.html($trs));
    // console.log("TRS :" + $trs);
    if($trs == "")
        return sleep(300).then(v => false);
    return sleep(300).then(v => true);
  }

  async function main() {
    for (let index = 0; index < urls.length; index++) {
        const uri = urls[index];
        await downloadHtml(uri);
        // console.log('Starting...');
        const boxScore = await parsePage();
        console.log(boxScore + " : " + uri);
    }
    // save the scraped results to disk
    // await fs.promises.writeFile(
    //   'boxscore.json',
    //   JSON.stringify(resultJSON)
    // );

    console.log('Done!');
  }
  
  main();