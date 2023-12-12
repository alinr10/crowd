import express from 'express';
import conn from './db.js';
import dotenv from 'dotenv'
import UserModel from './src/models/User.js'
import bcrypt from 'bcrypt'
import userRoute from './src/routes/userRoute.js';
import jobRoute from './src/routes/jobRoute.js';
import applicantRoute from './src/routes/applicantRoute.js'
import freelancerRoute from './src/routes/freelancerRoute.js'
import session from 'express-session';
import MongoStore from 'connect-mongo';
import multer from 'multer';
import path from 'path';
import axios from 'axios';


dotenv.config()

const app = express()
const port = 3001



const storage = multer.diskStorage({
  destination: '../frontend/public/uploads',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
app.use(upload.single('profilePhoto'));

app.set("trust proxy", 1);

app.use(session({
  secret: process.env.SECRET_TOKEN,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.DB_URI }),
  cookie: { secure: true, sameSite:'none' }
}));



app.use((req, res, next) => {
res.header("Access-Control-Allow-Origin", "https://crowd-app.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET, POST ,PUT,DELETE,PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-access-token");
  res.header("Access-Control-Allow-Credentials", "true");

  res.locals.user = req.session.user;
  next();
});



app.use(express.json())

conn()

app.use('/freelancer',freelancerRoute);
app.use('/user', userRoute);
app.use('/job',jobRoute);
app.use('/applicant',applicantRoute)
app.use('/uploads',express.static('uploads'));



const backendURL = 'https://crowd-app-qfen.onrender.com'; 

function pingBackend() {
  axios.get(backendURL) 
    .then(response => {
      console.log('Ping gönderildi, backend aktif!');
    })
    .catch(error => {
      console.error('Ping gönderme hatası:', error);
    });
}


const pingInterval = setInterval(pingBackend, 300000);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


pingBackend();
