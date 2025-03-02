// Import necessary modules
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import indexRouter from './routes/index';

// Create an instance of the Express application
const app = express();
const port = 8080;

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up session middleware to handle user sessions
app.use(session({
  secret: 'your-secret-key', // Secret key used to sign the session ID cookie
  resave: false, // Forces the session to be saved back to the session store, even if it was never modified during the request
  saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
  cookie: { secure: false } // Set to true if using HTTPS to ensure the cookie is only sent over HTTPS
}));

// Set the view engine to EJS for rendering HTML views
app.set('view engine', 'ejs');

// Set the directory where the view templates are located
app.set('views', path.join(__dirname, 'views'));

// Use the index router for handling routes starting with '/'
app.use('/', indexRouter);

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});