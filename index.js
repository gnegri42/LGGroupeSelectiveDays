const rp = require('request-promise-native');
const fs = require('fs');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const cron = require('node-cron');



// Function to send emails from sendgrip
// The mail send the city name when a vehicle is sold
function sendMail(vehicles) {
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const vehiclesList = vehicles.toString();

  const msg = {
    to: 'dev@agenceartemis.fr',
    from: 'dev@agenceartemis.fr',
    subject: 'Vehicules vendus',
    text: vehiclesList,
    html: vehiclesList,
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })
}


// // SENDING MAILS WITH NODEMAILER AND MAILTRAP AS TEST
// function sendMail(vehicles) {
//   var transport = nodemailer.createTransport({
//     host: "smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: "",
//       pass: ""
//     }
//   });

//   const vehiclesList = vehicles.toString();

//   message = {
//     from: "from-example@email.com",
//     to: "to-example@email.com",
//     subject: "Subject",
//     html: vehiclesList
//   };

//   transport.sendMail(message, (err, info) => {
//     if(err) {
//       console.log(err);
//     } else {
//       console.log(info);
//     }
//   })
// }

// const urls = [
//   'https://lggroupe.com/vehicule/?vehicule=327882970244',
//   'https://lggroupe.com/vehicule/?vehicule=355188040244',
//   'https://lggroupe.com/vehicule/?vehicule=357601410244',
//   'https://lggroupe.com/vehicule/?vehicule=349711360244',
//   'https://lggroupe.com/vehicule/?vehicule=350040000244',
//   'https://lggroupe.com/vehicule/?vehicule=353880730244',
//   'https://lggroupe.com/vehicule/?vehicule=342737090244',
//   'https://lggroupe.com/vehicule/?vehicule=352523590244',
//   'https://lggroupe.com/vehicule/?vehicule=344089540244',
//   'https://lggroupe.com/vehicule/?vehicule=357601020244',
//   'https://lggroupe.com/vehicule/?vehicule=357601970244',
//   'https://lggroupe.com/vehicule/?vehicule=355651360244',
//   'https://lggroupe.com/vehicule/?vehicule=357602750244',
//   'https://lggroupe.com/vehicule/?vehicule=357602250244',
//   // 'https://lggroupe.com/vehicule/?vehicule=322672930244', False vehicle for example
//   // 'https://lggroupe.com/vehicule/?vehicule=335824000244', False vehicle for example
// ]

// List of every links to check, as well as the city it is sold to
const vehiclesObject = [
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=327882970244',
    city : 'Albi'
  },
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=355188040244',
    city : 'Beziers'
  },
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=357601410244',
    city : 'Brive'
  },
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=349711360244',
    city : 'Carcassonne'
  },
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=350040000244',
    city : 'Castres'
  },
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=353880730244',
    city : 'Muret'
  },
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=342737090244',
    city : 'Narbonne'
  },
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=352523590244',
    city : 'Perpignan'
  },
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=344089540244',
    city : 'Toulouse'
  },
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=357601020244',
    city : 'Angouleme'
  },
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=357601970244',
    city : 'Cognac'
  },
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=355651360244',
    city : 'Limoges'
  },
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=357602750244',
    city : 'Royan'
  },
  {
    url : 'https://lggroupe.com/vehicule/?vehicule=357602250244',
    city : 'Perigueux'
  }
]

// Sleep function to be able to loop the async function
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Create an html document with the html page from the url
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

// Parse the html page to search if the vehicle details are still there or not (which would mean the vehicle is sold)
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
  if ($trs == "")
    return sleep(100).then(v => false);
  return sleep(100).then(v => true);
}

async function main() {
  var offlineVehicles = []; // to stock the sold vehicles

  // Looping through every vehicle to check if they are sold or not
  for (let index = 0; index < vehiclesObject.length; index++) {
    const uri = vehiclesObject[index].url;
    await downloadHtml(uri);
    // console.log('Starting...');
    const vehicleState = await parsePage();
    console.log(vehicleState + " : " + uri);
    if (!vehicleState)
      offlineVehicles.push(vehiclesObject[index].city);
  }

  // Send mail if we have sold vehicles
  if (offlineVehicles.length != 0)
    sendMail(offlineVehicles);
  console.log('Done!');
}

// Setting up cron task to run the function every day at midnight
// If test is needed, change the last two 0s to *, to launch the function every minute
cron.schedule('0 0 0 * * *', main);