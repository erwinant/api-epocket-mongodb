const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require("path")
const mongoose = require('mongoose')
const session = require('express-session')
const cors = require("cors")
const logger = require("morgan")
const MongoStore = require('connect-mongo')(session)
const routes = require('./routes')
const ErrorResponse = require('./helper/ErrorResponse')
const dotenv = require("dotenv")
const fileUpload = require('express-fileupload');
dotenv.config()

//connect to MongoDB
const connectionOpt = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}
mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:27017/emp_pocket`, connectionOpt)
// mongoose.connect('mongodb://userEmpPocket:Sunter123@localhost:27017/emp_pocket', connectionOpt)
const db = mongoose.connection

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
    // we're connected!
})

//use sessions for tracking logins
app.use(session({
    secret: 'mySecretKey',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}))

//attach morgan console logger
app.use(logger("dev"))

//cors
app.use(cors())

//fileupload
app.use(fileUpload());

// parse incoming requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


// serve static files from template
app.use(express.static(path.join(__dirname, "public")))

// include routes
app.use(routes)

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(ErrorResponse.create('Not found', 404))
})

// error handler
// define as the last app.use callback
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({ message: err.message })
})

// listen on port
const port = process.env.NODE_ENV === 'development' ? process.env.PORT : "3000";
app.listen(port, function () {
    console.log(process.env.NODE_ENV + ' listening on port ' + port)
})