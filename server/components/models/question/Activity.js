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
                activities: {
                    idProperty: 'activityId',
                    
                    indices: [
                        {
                            unique: true,
                            key: ['activityId']
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
                        compileReadObjectsQuery: function(activityId) {
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
                                    titleText: queryInput.titleText,
                                    descriptionText: queryInput.descriptionText || '',
                                    amountOfQuestion: queryInput.amountOfQuestion ,
                                    uid: user.uid
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
        var CreateActivityModel;

        return {
            __ctor: function () {
            },

            initModel: function() {
                /**
                 * ItemRatingFeedback
                 */
                return CreateActivityModel = sequelize.define('Activity', {
                    activityId: {type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true},
                    titleText: Sequelize.TEXT,
                    descriptionText: Sequelize.TEXT,
                    amountOfQuestion: Sequelize.INTEGER.UNSIGNED,
                    uid: {type: Sequelize.INTEGER.UNSIGNED}
                },{
                    freezeTableName: true,
                    tableName: 'activity',
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