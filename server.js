require('dotenv').config();
const path = require('path');
const express = require('express');

const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const session = require('express-session');

const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');

const app = express();

mongoose.connect(process.env.MONGODB_URI, {

});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongo connection error:'));
db.once('open', () => console.log('MongoDB connected'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: {
      maxAge: null, 
    },
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use('/', authRoutes);
app.use('/', groupRoutes);

app.get(/(.*)/, (req, res) => {
  res.redirect('/dashboard');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
