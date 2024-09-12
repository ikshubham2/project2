const express= require("express");
const app=express();
app.set('view engine','ejs');
const path = require('path');
const index = require('./routes/index');
const session=require('express-session');
app.use(session({
    secret:'your-secret-key',
    resave:false,
    saveUninitialized:true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/',index);
app.listen(8000,()=>console.log("server connected!!!"))


// module.exports=app;