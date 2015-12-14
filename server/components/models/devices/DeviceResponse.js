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
                responses: {
                    idProperty: 'responseId',
                    
                    indices: [
                        {
                            unique: true,
                            key: ['responseId']
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
                        compileReadObjectsQuery: function(responseId) {
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
                                    questionNumber: queryInput.questionNumber,
                                    answer: queryInput.answer
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
        var CreateDeviceResponseModel;

        return {
            __ctor: function () {
            },

            initModel: function() {
                /**
                 * ItemRatingFeedback
                 */
                return CreateDeviceResponseModel = sequelize.define('DeviceResponse', {
                    responseId: {type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true},
                    deviceId: Sequelize.INTEGER.UNSIGNED,
                    activityId: Sequelize.INTEGER.UNSIGNED,
                    questionNumber: Sequelize.INTEGER.UNSIGNED,
                    answer: Sequelize.INTEGER.UNSIGNED,
                },{
                    freezeTableName: true,
                    tableName: 'deviceresponse',
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
            }
        };
    }),

    Client: NoGapDef.defClient(function(Tools, Instance, Context) {
        return {
            __ctor: function () {
            },

            Public: {
            }
        };
    })
});