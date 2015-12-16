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
                    ],

                    members: {

                        compileReadObjectQuery: function(queryInput) {
                                return Promise.reject('error.invalid.request');
                                //where: { activityId: activityId}
                        },

                        /**
                         * TODO: Get all feedback of a particular item (identified by [`typeId`, `itemId`]).
                         */
                        compileReadObjectsQuery: function(resultId) {
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
                savaDeviceResult: function(deviceId, obj) {
                    this.results.createObject(obj,"true");
                    // make device enter matching state
                    // return Shared.DeviceStatus.runForDevice(deviceId, function(Instance) {
                    //     return Instance.DeviceSeek.client.matchingState();
                    // });
                }
            }
        };
    }),

    Client: NoGapDef.defClient(function(Tools, Instance, Context) {
        return {
            __ctor: function () {
            },

            Public: {
                receiveDeviceResult: function(deviceId, obj) {
                    this.host.savaDeviceResult(deviceId, obj);
                }
            }
        };
    })
});