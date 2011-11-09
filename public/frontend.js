// Simple Chat app
// frontend.js
window.onload = (function() {
    "use strict";
    var $ = function(id) {
            return document.getElementById(id);
        },
        // Chat Module
        simpleChat = (function() {
            // Open websocket connection
            var socket = io.connect(),
            
                updateMessages = function() {
                    var ul = $('messages'),
                        // Insert passed message to messages <ul>.
                        // Update only new messages.
                        add = function(m) {
                            var li = null;
                            // If not exist, construct message <li>.
                            if (!$('message-' + m.id)) {
                                li = document.createElement('li');
                                li.id = 'message-' + m.id;
                                li.innerHTML = '[' + m.time + '][' + m.username + ']' + ' > ' + m.message;
                                ul.appendChild(li);
                            }
                        };
                    // Return function, so only last part of this function is
                    // executed when calling function again.            
                    return function(data) {
                        // Fetch all messages from server. Pass each
                        // element to the add function.
                        data.rows.forEach(add);
                    };
                }(),
                
                sendMessage = (function() {
                    var getUsername = (function() {
                        var name = $('username').value;
                        // some validation here ...
                        return name;
                    }),
                        getMessage = (function() {
                            var message = $('input').value;
                            // some validation here ...
                            return message;
                        }),
                        getTime = (function() {
                            var time = new Date();
                            return time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
                        }),
                        data = {
                            $username: getUsername(),
                            $message: getMessage(),
                            $time: getTime()
                        };
                    // Send message to server
                    socket.emit('insertMessage', data);
                    $('input').value = "";
                });
                
            (function init() {
                // Request messages on startup         
                socket.emit('requestMessages', updateMessages);
                // Listen updateMessages from server
                socket.on('updateMessages', updateMessages);
                // Eventlistener to Send button and enter key.
                $('send').onclick = sendMessage;
                document.onkeydown = (function(e) {
                    if (e.keyCode == 13) { // enter key 
                        sendMessage();
                    }
                });
            }());
            
        }());
});