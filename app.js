require('dotenv').config()
const express= require("express");
const bodyparser =require("body-parser");
const mongoose =require("mongoose")
const app=express()
const ejs=require("ejs")
const path=require("path")
const session= require("express-session")
const passport= require("passport")
const passportLocalMongoose = require("passport-local-mongoose");
const port = process.env.PORT || 3000;


app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    secret:"todoapp",
    resave:false,
    saveUninitialized:true,
}))


app.use(passport.initialize());
app.use(passport.session());


app.use(bodyparser.urlencoded({extended : true}))
mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true});

const userSchema = new mongoose.Schema ({
    username: String,
    password: String,
  });

userSchema.plugin(passportLocalMongoose);
const User= mongoose.model("User",userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



const schema= new mongoose.Schema ({
    username:String,
    item : String,
    datepicked : String,
})
const Todom= mongoose.model("Todom", schema)



const currentDate = new Date();
const year = currentDate.getFullYear();
const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
const day = currentDate.getDate().toString().padStart(2, '0');
const formattedDate = `${year}-${month}-${day}`;

app.get("/",(req,res)=>{
    res.render("login")
})
app.get("/register", function(req, res){
    res.render("register");
  });



  app.post('/register', (req, res) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if (err) {
            console.error(err);
            return res.redirect('/register');
        }
        passport.authenticate('local')(req, res, () => {
            res.redirect('/profile');
        });
    });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/',
}));

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        const name = req.user.username;
        const userSession = req.session;
        userSession.myVariable = userSession.myVariable || formattedDate;

        const changeddate = userSession.myVariable;

        Todom.find({ datepicked: userSession.myVariable, username: name })
            .then((Listitems) => {
                res.render('list', { date: userSession.myVariable, items: Listitems, n: name });
            })
    } else {
        res.redirect('/');
    }
});

app.post('/insert', (req, res) => {
    const name = req.user.username;
    const userSession = req.session;
    const changeddate = userSession.myVariable;

    Todom.create({
        username: name,
        datepicked: changeddate,
        item: req.body.additem,
    })
        .then(() => {
            res.redirect('/profile');
        })
        
});

app.post('/input', (req, res) => {
    const changeddate = req.body.date;
    const name = req.user.username;
    const userSession = req.session;
    userSession.myVariable = changeddate;

    Todom.find({ datepicked: changeddate, username: name })
        .then((Listitems) => {
            res.render('list', { date: changeddate, items: Listitems, n: name });
        })
        
});

app.post('/delete', (req, res) => {
    Todom.findByIdAndRemove(req.body.itemdel)
        .then(() => {
            res.redirect('/profile');
        })
        
});


app.listen(port, ()=> console.log(`Listening on port ${port}`));
