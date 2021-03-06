/**
 * Created by lardtiste on 20/09/15.
 */
'use strict';

angular.module('core').factory('RoomService', ['Authentication','$timeout','Socket', 'MyRooms','MyPlaylists','$location','$stateParams',
    function(Authentication, $timeout, Socket, MyRooms, MyPlaylists, $location, $stateParams) {
        var _this = this;
        var authentication = Authentication;
        _this._data = {
            room: window.room,
            goToMyRoom : function(){
                if(authentication.user && authentication.user.room) {
                    $location.path('/' + authentication.user.room.conf.name);
                }
            },
            getMyRoom: function(){
                if(authentication.user){
                    MyRooms.get({userId : authentication.user._id}, function(result){
                        if(result.length === 1){
                            authentication.user.room = result[0];
                        }else{
                            //TODO Alert user has no room
                            alert("Problème d'intégrité de données, veuillez contacter un administrateur.");
                        }
                        return;
                    });
                }
            },
            sendInfo: function(command){
                if(command.name !== "ban"){
                    this.processInfo(command);
                }
                if(!(command.name === "playerStatus" && this.room.role === "standalone")){
                    Socket.emit('info', command);
                }


            },
            hasOwnerAutorizationForCommand : function(nomCommand){
                console.log("checking for user rights...");
                if(this.room.conf.owner._id + "" === authentication.user._id + ""){
                    return true;
                }else{
                    //TODO checker si l'utilisateur a les droits
                    for(var i = 0 ; i < this.room.policies.length ; i++){
                        for(var j = 0 ; j < this.room.policies[i].users.length ; j++){
                            if(this.room.policies[i].users[j] + "" === authentication.user._id + ""){
                                console.log("Finded user in policies");
                                if(this.room.policies[i].name + "" === "vip" && nomCommand !== "playerStatus"){
                                    console.log("User is in VIPs, return true");
                                    return true;
                                }
                                for(var k = 0 ; k < this.room.policies[i].allowedCommands.length ; k++){
                                    if(this.room.policies[i].allowedCommands[k].commandName + "" === nomCommand + ""){
                                        console.log("Command is allowed for user's group");
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                    console.log("Command is NOT allowed for user's group");
                    return false;
                }
            },
            processInfo : function(command){
                var __this = this;
                console.log("process info");

                console.log(command);
                if(typeof __this.room.messages === 'undefined'){
                    __this.room.messages = [];
                }

                switch(command.name){
                    case "userLeave":
                        __this.processUserLeave(command);
                        break;
                    case "joinUser":
                        __this.processJoinUser(command);
                        break;
                    case "alert":
                        __this.processAlert(command);
                        break;
                    case "playerStatus":
                        __this.processPlayerStatus(command);
                        break;
                    default:
                        break;
                }
            },
            processUserLeave : function(command){
                console.log("process userLeave");
                var self = this;
                this.room.messages.unshift({
                    text: command.user.username + "has left the room...",
                    user: {username : "Server"},
                    created: new Date()
                });
                this.room.conf.users.forEach(function(user, index){
                    if(user._id + "" === command.user._id + ""){
                        self.room.conf.users.splice(index, 1);
                    }
                });
            },
            processJoinUser: function(command){
                console.log("process addUser");

                this.room.messages.unshift({
                    text: command.user.username + "has joined the room!",
                    user: {username : "Server"},
                    created: new Date()
                });
                this.room.conf.users.push(command.user);
            },
            processAlert : function(command){
                alert("Alert : " + command.status);
            },
            processPlayerStatus : function(command){
                if(command.player){
                    this.room.player.isDouble = command.player.isDouble;
                }else if(command.playerStatus){
                    if(command.playerStatus.player === "left"){
                        if(typeof this.room.player.left === "undefined"){
                            this.room.player.left = {};
                        }
                        this.room.player.left.currentSound = command.playerStatus.currentSound;
                        this.room.player.left.status = command.playerStatus.status;
                        this.room.player.left.volume = command.playerStatus.volume;
                    }else{
                        if(typeof this.room.player.right === "undefined"){
                            this.room.player.right = {};
                        }
                        this.room.player.right.currentSound = command.playerStatus.currentSound;
                        this.room.player.right.status = command.playerStatus.status;
                        this.room.player.right.volume = command.playerStatus.volume;
                    }
                }else if(command.playerTotal){
                    this.room.player = command.playerTotal;
                }

            },
            instanciateDisposableRoom : function(){
                var __this = this;
                __this.room = {
                    conf: {
                        owner : authentication.user,
                        isDisposable : true
                    },
                    player : {
                        left : {},
                        right: {}

                    },
                    playlist: {
                        sounds : []
                    },
                    role : "owner"
                };
            }
        };
        return _this._data;
    }
]);
