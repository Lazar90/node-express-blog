require('dotenv').config()
const express = require('express');
const session = require('express-session');
const redis = require('redis');
const connectRedis = require('connect-redis');
const flash = require('express-flash')
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const passport = require('passport');
const app = express();

app.use(express.urlencoded({ extended: false }))
app.use(fileUpload());

const RedisStore = connectRedis(session);
const client = redis.createClient(process.env.REDIS_PORT);

app.use(session({
    store: new RedisStore({ client: client }),
	secret: process.env.SECRET_KEY,
	resave: false,
	saveUninitialized: true
}));
app.use(flash());

mongoose.connect(process.env.DB, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
});

// Passport.js
const initializePassport = require('./config/passport');
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Routes
const authRoutes = require('./routes/AuthRoutes');
const adminRoutes = require('./routes/AdminRoutes');
const blogRoutes = require('./routes/BlogRoutes');
const categoryRoutes = require('./routes/CategoryRoutes');

// View
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

// Global middleware
app.use(function(req, res, next){
    global.authUser = req.user;
    next();
});

app.get('/', (req, res) => res.render('home', {title: 'Home', }));

app.use('/admin/categories', categoryRoutes);
app.use('/admin/blog', blogRoutes);
app.use('/admin', adminRoutes);
app.use('', authRoutes);

app.listen(process.env.PORT);