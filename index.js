const express = require("express");
const socket = require("socket.io");

const app = express();

require('dotenv').config();


const { createClient } = require('@supabase/supabase-js')

// Create a single supabase client for interacting with your database
const supabase = createClient('https://aplpxfapazhrjvsfjdmo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbHB4ZmFwYXpocmp2c2ZqZG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNTAxNTgsImV4cCI6MjA1OTcyNjE1OH0.WkjRyxydhIfKnOn-h3-f7AO76Tl_Nw9xMqTTGM-zUjs')

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



function sendMail(to) {
    const msg = {
        to: to, // Change to your recipient
        from: 'Krishschavan@gmail.com', // Change to your verified sender
        subject: 'YOUR CLOTHES ARE READY!',
        text: 'Go get your clothes!',
        html: '<button href="google.com">Confirm you picked up your clothes</button>',
      }
      sgMail
        .send(msg)
        .then(() => {
          console.log('Email sent')
        })
        .catch((error) => {
        //   console.error(error)
            console.error(error.response.body);
        })
}






const { Resend } = require('resend');

const resend = new Resend('re_FZa48Tat_Q4fiRgns657pz1iArkYKPhm3');

resend.emails.send({
  from: 'Acme <krishschavan@gmail.com>', // onboarding@resend.dev
  to: ['krishschavan@gmail.com'],
  subject: 'hello world',
  html: '<p>it works!</p>',
});










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

app.get('/machine/:machineid', function(req,res){
    const machine_id = req.params.machineid;
    switch (machine_id) {
        case "w1":
            res.sendFile(path.join(__dirname, './app/pages/machine.html'));
            break;
        case "w2":
            res.sendFile(path.join(__dirname, './app/pages/machine.html'));
            break;
        case "d1":
            res.sendFile(path.join(__dirname, './app/pages/machine.html'));
            break;
        case "d2":
            res.sendFile(path.join(__dirname, './app/pages/machine.html'));
            break;
        default:
            res.send("No machine found.");
    }
    
});



const server = app.listen(process.env.PORT || 3001, () => {
	console.log(`Server running on port: ${process.env.PORT || 3001}`);
});

var io = socket(server);


io.on("connection", function (socket) {
    console.log("Made socket connection");

    const getAllmachineStatus = async function() {
        const { data, error } = await supabase
            .from('machine-status')
            .select('*')

        if (error) {
            console.error(error);
            // socket.emit('print', error);
        } else {
            socket.emit('all-machine-status', data);
        }
    };
    getAllmachineStatus();


    const getMachineStatus = async function(machineId) {
        const { data, error } = await supabase
            .from('machine-status')
            .select('available')
            .eq('id', machineId)
            .single()

        if (error) {
            console.error(error);
            // socket.emit('print', error);
        } else {
            return data;
        }
    }


    const setMachineStatus = async function(machineId) {
        const { data, error } = await supabase
            .from('machine-status')
            .update({ available: false })
            .eq('id', machineId)
            .single()

        if (error) {
            console.error(error);
            // socket.emit('print', error);
        } else {
            console.log(data);
            return data;
        }
    }

    socket.on('book-machine', async (machineId, email) => {
        const status = await getMachineStatus(machineId);
        if (status.available) {
            setMachineStatus(machineId);
            socket.emit('machine-booked-successfully', machineId);
            sendMail("krishschavan@gmail.com");
        }
    });
});