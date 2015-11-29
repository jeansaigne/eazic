'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('InitSocket', ['Authentication', '$state', '$timeout', 'RoomService','PlaylistService','Socket','ChatService',
    function (Authentication, $state, $timeout, RoomService, PlaylistService, Socket, ChatService) {
        // Connect to Socket.io server


        this.initListeners = function(){
            if (Socket.socket) {
                Socket.on('conf.join.ack', function(data){
                    console.log("conf.join.ack");
                    console.log(data);
                    if(data.isOk){
                        var oldRoom;
                        if(typeof RoomService.room !== 'undefined'){
                            oldRoom = angular.copy(RoomService.room);
                        }
                        RoomService.room = data.room;
                        if(typeof RoomService.room.player === 'undefined'){
                            RoomService.room.player = {};
                        }
                        if(data.status === "create"){
                            RoomService.room.player.role = "owner";
                            if(oldRoom && oldRoom.playlist.sounds.length > 0){
                                var commande = {
                                    name : "newPlaylist",
                                    playlist : oldRoom.playlist.sounds,
                                    user : Authentication.user
                                };
                                PlaylistService.sendCommand(commande);
                            }
                        }else{
                            RoomService.room.player.role = "ghost";
                            if(oldRoom && oldRoom.playlist.sounds.length > 0){
                                if(RoomService.hasOwnerAutorizationForCommand("addSounds")){
                                    if(confirm("Voulez vous ajouter votre file de lecture courante à celle de la room?")){
                                        var command = {
                                            name : "addSounds",
                                            sounds : oldRoom.playlist.sounds,
                                            user : Authentication.user
                                        };
                                        PlaylistService.sendCommand(command);
                                    }else{
                                        if(confirm("Voulez vous enregistrer la file de lecture? Dans le cas contraire elle sera perdue")){
                                            //TODO sauvegarder la playlist
                                        }
                                    }
                                }else {
                                    if (confirm("Voulez vous enregistrer la file de lecture? Dans le cas contraire elle sera perdue")) {
                                        //TODO sauvegarder la playlist
                                    }
                                }
                            }
                        }
                    }else{
                        //TODO process alert
                        alert("Probleme lors de la connection à la room... Statut : " + data.status);
                    }
                });
                Socket.on('info', function(command){
                    console.log("info");
                    console.log(command);
                    if(!(command.name === "playerStatus" && RoomService.room.isStandalone)){
                        console.log("process info call");
                        RoomService.processInfo(command);
                    }
                });
                Socket.on('playlist', function(command){
                    console.log("playlist event");
                    console.log(command);
                    PlaylistService.processCommand(command);
                });
                Socket.on('chat', function (message) {
                    if(typeof ChatService.messages === 'undefined'){
                        ChatService.messages = [];
                    }
                    ChatService.writeMessage(message);
                    console.log(message);
                });
            }
        };
    }
]);