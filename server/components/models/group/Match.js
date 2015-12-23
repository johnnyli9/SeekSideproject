/**
 * An ItemRatingCategory can be defined by the staff.
 * Users can then cast one vote for each category per problem or solution.
 * 
 */
"use strict";

var componentsRoot = '../../';
var libRoot = componentsRoot + '../lib/';

var NoGapDef = require('nogap').Def;

var SequelizeUtil = require(libRoot + 'SequelizeUtil');


module.exports = NoGapDef.component({
    Base: NoGapDef.defBase(function(SharedTools, Shared, SharedContext) { return {
        // RatingType: squishy.makeEnum([
        //     'GoodBad',
        //     'Range5'
        // ]),

        initBase: function() {
        },

        Caches: {
                matches: {
                    idProperty: 'matchId',
                    
                    indices: [
                        {
                            unique: true,
                            key: ['matchId']
                        },
                    ],

                    members: {

                        compileReadObjectQuery: function(queryInput) {
                                return Promise.reject('error.invalid.request');
                                //where: { activityId: activityId}
                        },

                        /**
                         * TODO: Get all feedback of a particular item (identified by [`typeId`, `itemId`]).
                         */
                        compileReadObjectsQuery: function(matchId) {
                            return {

                            };
                        },

                        compileObjectCreate: function(queryInput) {
                            var user = this.Instance.User.currentUser;
                            if (!queryInput || !user) {
                                return Promise.reject('error.invalid.request');
                            }

                                // check if rating is currently enabled
                                var newObj = {
                                    activityId: queryInput.activityId,
                                    groupId: queryInput.groupId,
                                    member: queryInput.member
                                };
                                return newObj;
                           
                        }
                    }
                }
            },

        Private: {
            
        }
    }; }),

    Host: NoGapDef.defHost(function(SharedTools, Shared, SharedContext) {
        var CreateMatchModel;

        return {
            __ctor: function () {
            },

            initModel: function() {
                /**
                 * ItemRatingFeedback
                 */
                return CreateMatchModel = sequelize.define('Match', {
                    matchId: {type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true},
                    activityId: Sequelize.INTEGER.UNSIGNED,
                    groupId: Sequelize.INTEGER.UNSIGNED,
                    member: Sequelize.TEXT,
                },{
                    freezeTableName: true,
                    tableName: 'match',
                    classMethods: {
                        onBeforeSync: function(models) {
                        },

                        onAfterSync: function(models) {
                            return Promise.join(
                                // create indices
                                // SequelizeUtil.createIndexIfNotExists(this.tableName, ['typeId', 'itemId', 'uid'], { indexOptions: 'UNIQUE'})
                            );
                        }
                    }
                });
            },

            initHost: function() {
            },

            Public:{
                test: function(targetDeviceId, selfDeviceId, activityId) {
                    var selfDeviceAgree;
                    Shared.DeviceStatus.runForDevice(targetDeviceId, function(Instance) {
                            Instance.DeviceSeek.client.receiver(targetDeviceId, selfDeviceId, activityId);
                            //  多少時間經過後沒有反應則重新回到nfc mode                     

                    });
                    
                },
                catchReceiver: function(agree, myselfId, callById, activityId){
                    if(agree){
                        console.log("ok!!!!! Group");
                        var obj = {};
                        obj.activityId = activityId;
                        obj.groupId = null;
                        obj.member = myselfId +","+ callById;
                        console.log(obj.activityId);
                        console.log(obj.groupId);
                        console.log(obj.member);
                        this.matches.createObject(obj, "true");
                        Shared.DeviceStatus.runForDevice(myselfId, function(Instance) {
                            Instance.DeviceSeek.client.matchDone();
                            //  多少時間經過後沒有反應則重新回到nfc mode                     

                        });
                        Shared.DeviceStatus.runForDevice(callById, function(Instance) {
                            Instance.DeviceSeek.client.matchDone();
                            //  配對成功的反應                    

                        });
                    }
                    else{
                        Shared.DeviceStatus.runForDevice(callById, function(Instance) {
                            Instance.DeviceSeek.client.backToNfc();
                            //  多少時間經過後沒有反應則重新回到nfc mode                     

                        });
                    }
                }
            }
        };
    }),

    Client: NoGapDef.defClient(function(Tools, Instance, Context) {
        return {
            __ctor: function () {
            },

            Public: {
                matchAction: function(targetDeviceId, selfDeviceId, activityId) {
                    // var selfDeviceAgree;
                    // Instance.DeviceStatus.runForDevice(targetDeviceId, function(Instance) {
                    //     selfDeviceAgree = Instance.DeviceSeek.client.receiver();
                    //     console.log("selfDeviceAgree ====" + selfDeviceAgree +"=====");
                    // });
                    // if (selfDeviceAgree) {
                    //     console.log("ok!!!!!Group");
                    // };
                    this.host.test(targetDeviceId, selfDeviceId, activityId);
                }
            }
        };
    })
});