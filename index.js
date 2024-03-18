require('dotenv').config()
const puppeteer = require('puppeteer')
const express = require('express')
const app = express()
const localEnv = process.env.PORT?true: false
const PORT = process.env.PORT || 5454 ;
const helmet = require("helmet");// Load the connectDB function
const rateLimit = require('express-rate-limit')
const fs = require('fs');
const cors = require('cors');
var cron = require('node-cron');
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
app.use(express.json());
// a middleware that formats the form data (currently a string that looks like query params) into a object we can use
app.use(express.urlencoded({ extended: true }))
app.use(helmet());


// look for static files (like css) in the public folder
app.use(express.static('public'))
app.use(limiter)
app.use(cors());


////:TODO uncomment this to create the task/ you can also update the time you want the task run
// var task = cron.schedule('0 23 * * 1-5', () => {
//   // This function will be executed every minute
//   fetch("https://canvas-meeting-publishing-production.up.railway.app/canvas")
// }, {timezone: 'America/New_York' // Set timezone to Eastern Time Zone});

// task.start();

app.get('/',async(req,res)=>{
  console.log('hello')
  res.status(200).json({code:'working'})
})


app.get('/canvas',async(req,res)=>{
  console.log('yay',req.body)

  try{
   

  canvasLink = process.env.canvas_zoom_link
  let browser
  if(!localEnv){
    browser = await puppeteer.launch({ 
      headless: false,//responsible for opening tab// making false for the browser to show up
      ignoreDefaultArgs: ['--disable-extensions'] ,
      args:['--no-sandbox', '--disable-setuid-sandbox']
    });
  }else{
    browser = await puppeteer.launch({ 
      headless: 'true',//responsible for opening tab
      ignoreDefaultArgs: ['--disable-extensions'] ,
      args:['--no-sandbox', '--disable-setuid-sandbox']
    });
  }


  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0); // Set the timeout to 0 to disable it
  let cookies = [];


  if (fs.existsSync('canvas.json')) {
  cookies = JSON.parse(fs.readFileSync('canvas.json', 'utf-8'));
  }
  await page.setCookie(...cookies);

   

  await page.goto(canvasLink,{ timeout: 0,slowMo: 500 });

     let url = await page.url(); 
    console.log("🚀 ~ file: index.js:154 ~ app.get ~ url:", url)


    if(url === "https://perscholas.instructure.com/login/canvas"){
      await page.type('#pseudonym_session_unique_id', process.env.canvas_id);
      await page.type('#pseudonym_session_password', process.env.canvas_password);
      const rememberButton = await page.waitForSelector('#pseudonym_session_remember_me');
      await rememberButton.evaluate(b => b.click()); 

      const Login = await page.waitForSelector('.Button--login');
    await Login.evaluate(b => b.click()); 


    
  }
await new Promise(resolve => setTimeout(resolve, 1000));
if(url === "https://perscholas.instructure.com/login/canvas"){
  cookies = await page.cookies();
  fs.writeFileSync('canvas.json', JSON.stringify(cookies));
}

const elementHandle = await page.waitForSelector('.tool_launch');
const frame = await elementHandle.contentFrame();

const openRecordings = await frame.waitForSelector('div[role="tab"]:nth-of-type(4)');
await openRecordings.evaluate(b => b.click()); 
console.log('cloud meeting click')
    await frame.waitForSelector('td button');
    await new Promise(resolve => setTimeout(resolve, 500));

    await frame.evaluate(() => {
      let meetings = Array.from(document.querySelectorAll('td button'))
      console.log(meetings,'meetings')
      let lastMeeting = meetings[0]
      console.log(lastMeeting.checked)
      if(!lastMeeting.checked){
        // lastMeeting.evaluate(b => b.click())
        lastMeeting.click()
      }

    });
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('done')
    res.status(200).json({status:'success'})
    await browser.close();
    return
    


}catch(err){
  
  console.log(err,'main eror')
console.log('close')

res.status(400).json({err:err.message})

  await browser.close();
  return
}
})








app.listen(PORT, () => { 
    console.log('Listening to the port:  ' + PORT, localEnv?'local':'production')

  
})



