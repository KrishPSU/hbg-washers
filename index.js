const express = require("express");
const socket = require("socket.io");
const app = express();


require('dotenv').config();


const { createClient } = require('@supabase/supabase-js')

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);



// index.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY); // replace with your key

async function sendEmail(to, subject, html) {
  try {
    const data = await resend.emails.send({
      from: 'HBG Washers <noreply@hbgwashers.com>', // this domain must be verified in Resend
      to: [`${to}`], // destination email(s)
      subject: subject,
      html: html,
    });

    console.log('✅ Email sent:', data);
    updateLogs(`✅ Email sent:${to}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    updateLogs(`❌ Error sending email:${to}`);
  }
}

// sendEmail();






// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/", express.static(__dirname + "/app/"));
// // app.use("/:sessionid", express.static(__dirname + "/app/"));
// app.use("/signin", express.static(__dirname + "/app/signin.html"));
// app.use("/signup", express.static(__dirname + "/app/signup.html"));



var path = require("path");
var bodyParser = require('body-parser');
var helmet = require('helmet');
var rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./app')));
app.use(helmet());
app.use(limiter);

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });
app.get('/', function(req,res){
    // res.send("Welcome!");
    res.sendFile(path.join(__dirname, './app/pages/index.html'));
});



app.get('/logs/:adminid', async (req, res) => {
    if (req.params.adminid != process.env.ADMIN_ID) {
        res.send("Invalid admin id");
        return;
    }
    const { data, error } = await supabase
        .from("logs")
        .select('*')
    
        if (error) {
            console.error(error);
            return;
        }
        res.send(data);
});



const server = app.listen(process.env.PORT || 3001, () => {
	console.log(`Server running on port: ${process.env.PORT || 3001}`);
    updateLogs(`Server running on port: ${process.env.PORT || 3001}`, "SERVER START")
});

var io = socket(server);


io.on("connection", function (socket) {
    console.log("Made socket connection");
    updateLogs("Made socket connection", "LOG");

    const getAllmachineStatus = async function() {
        const { data, error } = await supabase
            .from(process.env.DB)
            .select('*')

        if (error) {
            console.error(error);
            updateLogs(error, "ERROR");
        } else {
            socket.emit('all-machine-status', data);
        }
    };
    getAllmachineStatus();


    const getMachineStatus = async function(machineId) {
        const { data, error } = await supabase
            .from(process.env.DB)
            .select('available')
            .eq('id', machineId)
            .single()

        if (error) {
            console.error(error);
            updateLogs(error, "ERROR");
        } else {
            return data;
        }
    }


    const setMachineStatus = async function(machineId, status, time_set, personThatBooked) {
        const currentTimeString = getFutureTime();
        let timeEndString;
        
        if (time_set == "30 mins") {
            timeEndString = getFutureTime(30);
        } else if (time_set == "1 hour") {
            timeEndString = getFutureTime(60);
        } else if (time_set == "1 hour 30 mins") {
            timeEndString = getFutureTime(90);
        }


        const { data, error } = await supabase
            .from(process.env.DB)
            .update({ available: status, time_booked: currentTimeString, time_end: timeEndString, person_that_booked: personThatBooked })
            .eq('id', machineId)
            .single()

        if (error) {
            console.error(error);
            updateLogs(error, "ERROR");
        }

	return timeEndString;
    }

    socket.on('book-machine', async (machineId, email, time) => {
        const status = await getMachineStatus(machineId);
        if (status.available) {
            let bookedTill = setMachineStatus(machineId, false, time, email);
            socket.emit('machine-booked-successfully', machineId, bookedTill);
            sendEmail(
                email.trim(),
                `${getMachineNameById(machineId)}, SUCCESSFULLY BOOKED!`,
                `<html>
                    <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
                        <table style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px;">
                        <tr>
                            <td style="text-align: center;">
                            <h2 style="color: #4CAF50;">✅ Washer Booked</h2>
                            <p style="font-size: 16px; color: #333;">
                                Your washer at <strong>HBG Washers</strong> has been successfully booked for ${time}!
                            </p>
                            <p style="font-size: 14px; color: #555;">
                                Your spot is confirmed. You will be notified when your time is up and your clothes are done.
                            </p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #999;">
                                Thank you for using HBG Washers! 🧺
                            </p>
                            </td>
                        </tr>
                        </table>
                    </body>
                </html>`
            );
            remindUser(machineId, email.trim(), time);
        } else {
            socket.emit('machine-already-booked', machineId);
        }
    });





    const remindUser = (machineId, email, time) => {

        let time_in_milli_secs;
    
        switch(time) {
            case "30 mins":
                time_in_milli_secs = 30 * 60 * 1000;    // 30 mins
                break;
            case "1 hour":
                time_in_milli_secs = 60 * 60 * 1000;    // 1 hour
                break;
            case "1 hour 30 mins":
                time_in_milli_secs = 90 * 60 * 1000;    // 1 hour 30 mins
                break;
            default:
                time_in_milli_secs = 0;
                return;
        }
    
        if (time_in_milli_secs == 0) {
            console.error(`Time:${time} is not right...`);
            updateLogs(`Time:${time} is not right...`, "ERROR");
            return;
        }
    
    
        console.log(`Machine:${machineId} will be done in ${time}.`);
        updateLogs(`Machine:${machineId} will be done in ${time}.`, "LOG");
      
        setTimeout(() => {
          // Update DB or internal state
          console.log(`Machine:${machineId} is done.`);
          updateLogs(`Machine:${machineId} is done.`, "LOG");
          

          setMachineStatus(machineId, true);


          sendEmail(
            email,
            "Your laundry is done! 🧺 Time to pick it up",
            `<html>
                <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
                    <table style="max-width: 500px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 20px;">
                    <tr>
                        <td style="text-align: center;">
                        <h2 style="color: #4CAF50;">✅ Washer Complete</h2>
                        <p style="font-size: 16px; color: #333;">
                            Your laundry is done! Please pick it up to keep the machines available for others.
                        </p>
                        <p style="font-size: 14px; color: #555;">
                            Thanks for using <strong>HBG Washers</strong>. If you need to start another load, machines are ready!
                        </p>
                        <div style="margin: 20px 0;">
                            <a href="https://hbgwashers.com/" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">
                            Book Another Machine
                            </a>
                        </div>
                        <p style="font-size: 12px; color: #999;">Sent automatically by HBG Washers</p>
                        </td>
                    </tr>
                    </table>
                </body>
            </html>`
        );
        }, time_in_milli_secs);
      };




    socket.on('new-feedback', (feedbackText) => {
        sendEmail("Krishschavan@gmail.com", "New feedback reported", `
            <html>
                <body>
                    <div>
                        <p>
                            <span>
                                "
                            </span>
                            ${feedbackText}
                            <span>
                                "
                            </span>
                        </p>
                    </div>
                </body>
            </html>
        `);
        updateLogs(feedbackText, "FEEDBACK");
    });
});


function getMachineNameById(machineId) {
    switch(machineId) {
        case "w1":
            return "Washer 1";
        case "w2":
            return "Washer 2";
        case "d1":
            return "Dryer 1";
        case "d2":
            return "Dryer 2";
        default:
            console.error(`Machine id:${machineId} non-existent.`);
            updateLogs(`Machine id:${machineId} non-existent.`, "ERROR");
            return "404";
    }
}



async function updateLogs(content, type) {
    if (true) {
        const { error } = await supabase
            .from('logs')
            .insert({ content: content, type: type })

        if (error) {
            console.error(error);
            return;
        }
    }
}


function getFutureTime(addMinutes = 0) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + addMinutes);

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12

    return `${hours}:${minutes}:${seconds} ${ampm}`;
}
