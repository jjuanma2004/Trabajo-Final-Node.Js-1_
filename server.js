var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var redis = require('redis');
var client = redis.createClient();


var session = require('express-session');
var RedisStore = require('connect-redis')(session);


var passport = require('passport');


var flash = require('connect-flash');


var logger = require('morgan');

var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');

var path = require('path');
var _ = require('lodash');


var swig = require('swig');

var usuarios = [];
var clientes = {};


var Usuario = require('./models/usuarios');
var Mensaje = require('./models/mensajes');


app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');


app.set('view cache', false);
swig.setDefaults({ cache: false });

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  store : new RedisStore({}),
  secret : 'nextapp'
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(flash());


passport.serializeUser(function(user, done) {
  console.log("Serialize: "+user);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("Deserialize: "+obj);

  done(null, obj);
});


var routes = require('./routes/routes');
routes(app);


var local = require('./connections/local');
local(app);
var twitter = require('./connections/twitter');
twitter(app);



function storeMessages(usuario, mensaje){

  var objeto = new Mensaje({usuario : usuario, mensaje : mensaje});
  objeto.save(function (err, mensaje){
    if (err) {console.log(err);}
    console.log(mensaje);
  });

}

io.on('connection', function(socket){

  socket.on('disconnect', function(){
    console.log('user disconnected');
    client.hdel("usuarios", socket.id);
  });

    socket.on('mousedown', function (datos) {
        io.emit('mousedown', datos);
    });

    socket.on('mousemove', function (datos) {
        io.emit('mousemove', datos);
    });

    socket.on('mouseup', function (datos) {
        io.emit('mouseup', datos);
    });

    socket.on('mouseleave', function (datos) {
        io.emit('mouseleave', datos);
    });

});

server.listen(3000, function(){
	console.log('Servidor corriendo en el puerto 3000');
});
