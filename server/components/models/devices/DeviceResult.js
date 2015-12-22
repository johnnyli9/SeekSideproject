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
                results: {
                    idProperty: 'resultId',
                    
                    indices: [
                        {
                            unique: true,
                            key: ['resultId']
                        },
                        {
                            unique: false,
                            key: ['deviceId']
                        },
                        {
                            name: 'byAidAndDid',
                            unique: true,
                            key: ['activityId','deviceId']
                        }
                    ],

                    members: {

                        compileReadObjectQuery: function(queryInput) {
                                // return Promise.reject('error.invalid.request');
                                //where: { activityId: activityId}
                                

                        },

                        /**
                         * TODO: Get all feedback of a particular item (identified by [`typeId`, `itemId`]).
                         */
                        compileReadObjectsQuery: function(queryInput) {
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
                                    deviceId: queryInput.deviceId,
                                    activityId: queryInput.activityId,
                                    result: queryInput.result,
                                    isGroup: queryInput.isGroup,
                                    groupId: queryInput.groupId
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
        var CreateDeviceResultModel;

        return {
            __ctor: function () {

            },

            initModel: function() {
                /**
                 * ItemRatingFeedback
                 */
                return CreateDeviceResultModel = sequelize.define('DeviceResult', {
                    resultId: {type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true},
                    deviceId: Sequelize.INTEGER.UNSIGNED,
                    activityId: Sequelize.INTEGER.UNSIGNED,
                    result: Sequelize.TEXT,
                    isGroup: Sequelize.INTEGER.UNSIGNED,
                    groupId: Sequelize.INTEGER.UNSIGNED,
                },{
                    freezeTableName: true,
                    tableName: 'deviceresult',
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

            Public: {
                // save DeviceResult to DB
                saveDeviceResult: function(obj) {
                    this.results.createObject(obj,"true");
                }

            }
        };
    }),

    Client: NoGapDef.defClient(function(Tools, Instance, Context) {
        return {
            __ctor: function () {
            },

            Public: {
                receiveDeviceResult: function(obj) {
                    this.host.saveDeviceResult(obj);
                },

                testtt: function() {
                    this.results.readObjects();
                    
                    return Promise.delay(500)
                    .bind(this)
                    .then(function() {
                        var aa = this.results.indices.byAidAndDid.get(1,3);
                        console.log(aa);
                    });
                },

                compareTwoDevice: function(targetDeviceId, selfDeviceId, activityId) {
                    
                    this.results.readObjects();
                    console.log("enter cpmpareTwoDevice");

                    Promise.delay(100).bind(this).then(function(){

                        var result = 0;
                        var target = this.results.indices.byAidAndDid.get(activityId,targetDeviceId);
                        var self = this.results.indices.byAidAndDid.get(activityId,selfDeviceId);
                        for (var i = 0; i < target.result.length; i++ ) {
                            if(target.result[i] == self.result[i]){
                                result++;
                            }
                        }
                        console.log(target);
                        console.log(self);
                        console.log(result);
                        
                        this.Instance.DeviceSeek.callAlike(result,targetDeviceId);
                    });




                    
                    // 拿出兩個device的資料做比對
                    // var targetAllResults = this.results.readObject("3", "true");
                    // console.log("dddddd"+targetAllResults);
                    // var selfAllResults = this.results.indices.resultId.get("3");
                    // return targetAllResults;
                    // this.testt();
                    // console.log(selfAllResults);
                }

            }
        };
    })
});