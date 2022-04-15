/* 
Creation of the directory "Mongoose-api-tutorial" where I will run the node server,
Command npm init to install JSON package.
Creation of the file "server.js"
Installation of all the required modules in the terminal

Creation of the variables to store all the modules installed
*/

const express = require('express') // Use to make request to the server by creating different routes
const mongoose = require('mongoose') // Library of mongo db, I use it to create schemas and models
const bodyParser = require('body-parser') // Parsing incoming request bodies in a middleware
const session = require('express-session') // Allow to manage session of a user

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.use(session({
    secret: 'secret',
    name: 'uniqueID',
    saveUninitialized:false
  }))

app.set('view engine', 'ejs') // ejs allows to create html templates and you can inject datas into html


let dbo = "mongodb://localhost:27017/jmdb" // Path to my database


// Creation of a schema administrator, schema allows us to add constraints to our database to have more integrity
let carDealerSchema = mongoose.Schema({
    // carDealerID: String,
    username: String,
    password: String
})
    
// Creation of a schema car inventory, manually I created a reference "username" between the two documents
let carInventorySchema = mongoose.Schema({
    year: String,
    maker: String,
    model: String,
    InStock: Boolean,
    username: String
    // carDealerID: String
})

// Creation of the models (collections in the db) that will follow the schemas mentioned above
const carDealer = mongoose.model("carDealer", carDealerSchema, 'carDealer')
const carInventory = mongoose.model("carInventory", carInventorySchema, 'carInventory')

/* 
Creation of a route / using a get request, 
Here we check if the user is connected with the session module (req.session.loggedIn)

If so, we connect to the database and find all documents inside the collection "carInventory"
And then we display a webpage using "ejs templating"

If the user is not connected, he is rediredted to the "signup" route.
*/

app.get('/', function(req,res){  
    if(req.session.loggedIn) {  
        let user = req.session.username
  
        mongoose.connect(dbo).then(()=>{
        console.log("db success")
        carInventory.find({}, function(err,data){
            console.log("success")
            console.log(data)

            res.render('index.ejs',{post:data}) 
        })
        })   
    } else {res.redirect('/signup')
}    
})

// Creation of the "signup" route using get request
// Every time we create a route we use a callback function with two arguments "request" and "response"
// Here we send a html "signup form" to the route "/signup"
// The "signup form" has an action "/register" which specifies the route and a method "POST"
app.get('/signup', function(req,res){
    res.sendFile('signup-form.html', {root : __dirname});      
})

// Post method is used to send sensitive datas to the server, it will travel in the header request
// Connection to the database
// Here we create a new object from the model
// With "post method" we have to parse the data, that is why we use body in the request
app.post('/register', function(req,res){
    mongoose.connect(dbo).then(()=>{

    let dealer = new carDealer({
        username: req.body.username, // Grab info from the input
        password: req.body.password // Grab info from the input
    })

    dealer.save().then(result => { // This operation allows to insert the datas into the db
        console.log(result)
        res.redirect('/signin') // Now the registerion is done, we redirect the user to the 'signin page'
    })
    })
})

// Creation of the route "/signin" where we send the 'login form'
// In the 'signin form' there is an action '/login' and a method 'POST'
app.get('/signin', function(req,res){
        res.sendFile('login-form.html', {root : __dirname});   
})

// Post request
app.post('/login', function(req,res){
    mongoose.connect(dbo).then(()=>{ // Connection to the db
        console.log("db success")

        // Look for datas in the db using the find method
        carDealer.find({"username": req.body.username}, function(err,data){
          console.log(data)
            // console.log(data[0].username)
            if (data.length > 1) {
  
            // Check if the username matches the username in the db
             
              if(req.body.password === data[0]['password']){
                req.session.username = data[0]['username']
                req.session.loggedIn = true
                console.log(req.session.loggedIn)
              } else {
                res.redirect('/signin')
             } 
            } else {console.log("no data")}
                 
            
            // Redirect to the homepage
            res.redirect('/')
          })       
        })
})


// Insert datas with a get request. Get request can either get or post data
app.get('/addcar', function(req,res){
    mongoose.connect(dbo).then(()=>{
    console.log("db success")

    // In a get request, we use query in the request 
    let carT = new carInventory ({
        year: req.query.year, // Grab info from the input
        maker: req.query.carmaker, // Grab info from the input
        model: req.query.carmodel, // Grab info from the input
        InStock: true, // Grab info from the input
        username: req.session.username // Grab info from the input
    })
    
    carT.save(function (err){
    console.log("Car added")
    res.redirect('/')
// res.render('index.ejs',{post:data, user:user}) 
    })
    })
})



app.get('/delete', function(req, res) {
    mongoose.connect(dbo).then(()=>{
        console.log("db success")
        console.log(req.query.ids)

        // Query datas in mongodb by Unique id
        let query = {
            _id:  req.query.ids
        }

        // Delete the datas found with the query object
        carInventory.deleteOne(query, function(err, result){
        console.log("success")
        res.redirect('/')
    })
})
})


app.get('/update', function(req, res) {
    if(req.query.update === "update") {
        mongoose.connect(dbo).then(() => {
            console.log("db success")
            console.log(req.query.ids)
    
            // Query datas in mongodb by Unique id
            let query = {
                _id: req.query.ids   
            }
    
            // New datas to update - $set will overwrite the existing datas
            let newdata = {$set: {
                "maker": req.query.updatemaker, 
                "model": req.query.updatemodel, 
                "year": req.query.updateyear, 
                "InStock": req.query.updatestock, 
                "username": req.query.updateusername
            }}
    
            // Update datas
            carInventory.updateOne(query, newdata, function(err, result){
                if (result){
                    console.log(result)
                    res.redirect('/')
                }           
            })
        })
    }
})

app.get('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy();
      }
      res.redirect('/')
})



app.listen(3001)

 











// Delete datas
// app.get('/delete', function(req, res){
//     console.log(req.query)
//     if(req.query.update === "update") {
//         mongoose.connect(dbo).then(()=>{
//             console.log("db success")
//             console.log(req.query.ids)
    
//             let query = {
//                 _id: req.query.ids   
//             }
    
//             let newdata = {$set: {
//                 "maker": req.query.maker 
//                 // "model": req.query.updatemodel, 
//                 // "year": req.query.updateyear, 
//                 // "InStock": req.query.updatestock, 
//                 // "username": req.query.updateusername
//             }}
    
    
//             carInventory.updateOne(query, newdata, function(err, result){
//                 if (result){
//                     console.log(result)
//                     res.redirect('/')
//                 }           
//         })
//     })

//     }
//     else {
//     mongoose.connect(dbo).then(()=>{
//         console.log("db success")
//         console.log(req.query.ids)
//         let query = {
//             _id:  req.query.ids
//         }
//         carInventory.deleteOne(query, function(err, result){
//         console.log("success")
//         res.redirect('/')
//     })
// })
// }
// })



// app.get('/find', function(req,res){
    //     mongoose.connect(dbo).then(()=>{
    //         console.log("db success")
    //         console.log(req.query.ids)
    
    //         let query = {
    //             _id: req.query.ids   
    //         }
    
    //         let newdata = {$set: {
    //             "maker": req.query.updatemaker, 
    //             "model": req.query.updatemodel, 
    //             "year": req.query.updateyear, 
    //             "InStock": req.query.updatestock, 
    //             "username": req.query.updateusername
    //         }}
    
    
    //         carInventory.updateOne(query, newdata, function(err, result){
    //             if (result){
    //                 console.log(result)
    //                 res.redirect('/')
    //             }           
    //     })
    // })
    // })