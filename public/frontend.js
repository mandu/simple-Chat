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
                        area = $('message-area'),
                        
                        autoScroll = function(current, max) {                            
                            if (current === max) {
                                // Scrollbar is moved automatically
                                // only when it is in the bottom.
                                area.scrollTop = area.scrollHeight - area.clientHeight;
                            }
                        },
                        // Insert passed message to messages <ul>.
                        // Update only new messages.
                        add = function(m) {
                            var li = null,
                                currentScroll = area.scrollTop,
                                maxScroll = area.scrollHeight - area.clientHeight;
                                
                            // If not exist, construct message <li>.
                            if (!$('message-' + m.id)) {                                                    
                                li = document.createElement('li');
                                li.id = 'message-' + m.id;
                                li.innerHTML = '[' + m.time + '][' + m.username + ']' + ' > ' + m.message;
                                ul.appendChild(li);
                                                                
                                autoScroll(currentScroll, maxScroll);
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
                    var valid = true,
                    
                        validation = (function(el) {
                            if (!el.value) {
                                var classState = el.className;
                                valid = false;
                                el.className += ' notvalid';
                                // revert class state
                                setTimeout(function() {
                                    el.className = classState;
                                }, 700);
                            }
                        }),
                        
                        getUsername = (function() {
                        var name = $('username');
                        validation(name);                        
                        return name.value;
                        }),
                    
                        getMessage = (function() {
                            var message = $('input');
                            validation(message);                            
                            return message.value;
                        }),
                        
                        getTime = (function() {
                            var time = new Date(),
                                fixedTime = [time.getHours(), time.getMinutes(), time.getSeconds()];
                            // Fix one number presentation    
                            fixedTime.forEach(function(value, index, array) {
                                array[index] = (value.toString().length === 1) ? '0' + value.toString() : value;
                            });

                            return fixedTime[0] + ':' + fixedTime[1] + ':' + fixedTime[2];
                        }),
                        data = {
                            $username: getUsername(),
                            $message: getMessage(),
                            $time: getTime()
                        };
                    // Send message to server
                    if(valid) {
                        socket.emit('insertMessage', data);
                        $('input').value = "";
                    }
                });
                
            (function init() {
                // Focus to message field
                $('input').focus();
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