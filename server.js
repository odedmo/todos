/* ===== get the packages we need ===== */

var express = require('express');
var app = express();

var crypto = require('crypto');

var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
// used to create, sign, and verify tokens
var jwt = require('jsonwebtoken');
// get our config file
var config = require('./config');
// get our mongoose models
var User = require('./models/user');
var Todo = require('./models/todo');
// get an instance of the router for api routes
var apiRoutes = express.Router();

/* ===== configuration ===== */

var port = process.env.PORT || 8080;
// connect to database
mongoose.connect(config.database);
// secret variable
app.set('superSecret', config.secret);
// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));
// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

/* ===== routes ===== */

app.get('/', function(req, res) {
  res.sendfile('./public/views/index.html');
});

// route to authenticate a user (POST http://localhost:8080/api/login)
apiRoutes.post('/login', function(req, res) {
  // find the user
  User.findOne({
    name: req.body.userName
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({
        success: false,
        message: 'Authentication failed. User not found.',
        status: 'error'
      });
    } else if (user) {
      // use hashed password
      var hash = crypto
        .createHash("md5")
        .update(req.body.password)
        .digest('hex');
      // check if password matches
      if (user.password != hash) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password.',
          status: 'error'
        });
      } else {
        // if user is found and password is right
        // create a token
        var token = jwt.sign({
          username: req.body.userName
        }, app.get('superSecret'), {
          expiresInMinutes: 120
        });
        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Welcome ' + req.body.userName,
          status: 'success',
          name: req.body.userName,
          userId: user.id,
          token: token
        });
      }

    }

  });
});

apiRoutes.post('/signUp', function(req, res) {

  User.findOne({
    name: req.body.userName
  }, function(err, user) {

    if (err) {
      throw err;
    }
    //if username already exist
    if (user != null) {
      res.json({
        success: false,
        message: 'This user name already exists',
        status: 'error'
      });
    }
    // if username is ok to use 
    else {
      // hash password
      var hash = crypto
        .createHash("md5")
        .update(req.body.password)
        .digest('hex');
      // add new user to db
      var newUser = new User({
        name: req.body.userName,
        password: hash,
        admin: true
      });

      // save the sample user
      newUser.save(function(err, user) {

        if (err) {
          throw err;
        }

        // create token
        var token = jwt.sign({
          username: newUser.name
        }, app.get('superSecret'), {
          expiresInMinutes: 30
        });

        res.json({
          success: true,
          message: 'Welcome ' + req.body.userName,
          status: 'success',
          name: req.body.userName,
          userId: user.id,
          token: token
        });
      });
    }
  });
});

apiRoutes.get('/logout', function(req, res) {
  res.json({
    "status": "info",
    "message": "Logged out successfully"
  });
});

// -----------------------------------

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided'
    });

  }
});

// check if user is signed in

apiRoutes.get('/signedin', function(req, res) {
  jwt.verify(req.query.token, app.get('superSecret'), function(err, decoded) {
    if (err) {
      return res.json({
        success: false,
        message: 'Failed to authenticate token'
      });
    } else {
      // if everything is good, save to request for use in other routes
      return res.json({
        success: true,
        message: 'logged in',
        username: decoded.username
      });
    }
  });
});

// get todos
apiRoutes.get('/todos', function(req, res) {
  Todo.find({}, function(err, todos) {
    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
    if (err) {
      res.send(err);
    }
    // return all todos in JSON format
    res.json({
      success: true,
      todos: todos
    });
  });
});

apiRoutes.post('/todos', function(req, res) {
  Todo.find({
    'userId': req.body.userId
  }, function(err, todos) {
    if (err) {
      res.send(err);
    }
    res.json({
      success: true,
      todos: todos
    });
  });
});

// create todo and send back all todos after creation
apiRoutes.post('/todo', function(req, res) {

  // create a todo, information comes from AJAX request from Angular
  Todo.create({
    text: req.body.text,
    userId: req.body.userId,
    done: false
  }, function(err, todo) {
    if (err) {
      res.send(err);
    }
    // get and return all the todos after you create another
    Todo.find({
      'userId': req.body.userId
    }, function(err, todos) {
      if (err) {
        res.send(err);
      }
      res.json({
        success: true,
        todos: todos
      });
    });
  });

});

// delete todos
apiRoutes.post('/deleteTodos', function(req, res) {

  Todo.remove({
    _id: {
      $in: req.body.checked
    }
  }, function(err, todo) {
    if (err) {
      res.send(err);
    }

    // get and return all the updated todos
    Todo.find({
      'userId': req.body.userId
    }, function(err, todos) {
      if (err)
        res.send(err)
      res.json({
        success: true,
        todos: todos
      });
    });
  });
});

/* ===== start the server ===== */

app.listen(port);
console.log('Magic happens on' + port);