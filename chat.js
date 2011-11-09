var connect = require('connect'),
    server = initServer(),
    io = require('socket.io').listen(server),
    sqlite3 = require('sqlite3');
    

function initServer() {
    return connect.createServer(
        connect.logger(),
        connect.static(__dirname + '/public')
    ).listen(8000);
}

// Web socket begin
io.sockets.on('connection', function(socket) {    
    var sendMessages = (function () {
        database.queryAll(function(err, rows) {
            // Send updateMessages request to client
            io.sockets.emit('updateMessages', { rows: rows } );
        });
    }),
    
    sendNewMessage = (function () {
        database.queryLatest(function(err, rows) {
            // Send updateMessages request to client
            io.sockets.emit('updateMessages', { rows: rows } );
        });
    }),
    
    insertMessage = (function(msg) {
            database.insert(msg, sendNewMessage );
    });
    
    
    // Listen clients requests        
    socket.on('requestMessages', sendMessages);
    socket.on('insertMessage', insertMessage);
});
// Web socket end

// Sqlite3 begin
var database = (function() {
    var db = new sqlite3.Database('db/messages.db'), 
    
        create = (function() {        
                db.run("CREATE TABLE IF NOT EXISTS messages" +
                        "( id INTEGER PRIMARY KEY," +
                        "username TEXT, " +
                        "message TEXT, " +
                        "time TEXT )");
        }),
        
        queryAll = (function (cb) {
                db.all("SELECT * FROM messages", cb);
        }),
        
        queryLatest = (function (cb) {
                db.all("SELECT * FROM messages ORDER BY id DESC LIMIT 1", cb);
        }),
        
        insert = (function (msg, cb) {
                var stmt = db.prepare("INSERT INTO messages " +
                            "(username, message, time)" +
                            "VALUES ($username, $message, $time)");
                // Bind message from client
                stmt.run(msg, cb);
        });
    
    (function init() {
        create();
    }());
    
    return {
        queryAll: queryAll,
        queryLatest: queryLatest,
        insert: insert
    };
}());
// Sqlite3 end