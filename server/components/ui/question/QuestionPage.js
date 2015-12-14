/**
 * 
 */
"use strict";

var NoGapDef = require('nogap').Def;

module.exports = NoGapDef.component({
    /**
     * Everything defined in `Host` lives only on the host side (Node).
     */
    Host: NoGapDef.defHost(function(SharedTools, Shared, SharedContext) { 
        return {
            Assets: {
                Files: {
                    string: {
                        template: 'QuestionPage.html',
                        modalActivityTemplate: 'CreateActivity.html',
                        modalEditActivityTemplate: 'EditActivity.html',
                        modalDeleteActivityTemplate : 'DeleteActivity.html',
                    }
                },
                AutoIncludes: {
                }
            },
                    
            /**
             * 
             */
            initHost: function() {
                
            },
            
            /**
             * Host commands can be directly called by the client
             */
            Public: {
                
            },
        };
    }),
    
    
    /**
     * Everything defined in `Client` lives only in the client (browser).
     */
    Client: NoGapDef.defClient(function(Tools, Instance, Context) {
        var ThisComponent;


        var invalidateView = function() {
            if (scope && !scope.$$phase) scope.$digest();
        };

        return {
            __ctor: function() {
                ThisComponent = this;
            },

            /**
             * Prepares the home page controller.
             */

            initClient: function() {
                UserRole = Instance.User.UserRole;
            },


            setupUI: function(UIMgr, app) {
                // create Home controller
                app.lazyController('questionCtrl',[ '$scope','$modal', function($scope,$modal) {
                    UIMgr.registerPageScope(ThisComponent, $scope);
                    
                    // customize your HomePage's $scope here:

                    $scope.activitiesInfo = Instance.Activity.activities.list;

                    // create activity
                    $scope.createActivity = function() {    
                        $scope.activityRenderModal('lg', function() {
                            // user pressed Ok -> Do delete article!
                            //$scope.delete(article); 
                        });
                    };

                    $scope.activityRenderModal = function (size, onOk, onDismiss) {
                        var modalInstance = $modal.open({
                            template: ThisComponent.assets.modalActivityTemplate ,
                            size: size,
                            resolve: {
                                items: function () {
                                }
                            },

                            controller: function ($scope, $modalInstance, items) {

                                // initial show question amount
                                var allQuestionAmount = 1;
                                // initial show question
                                $scope.showQuestion = {};
                                $scope.showQuestion[1] = 0;
                                $scope.showQuestion[2] = 0;
                                $scope.showQuestion[3] = 0;
                                $scope.showQuestion[4] = 0;

                                $scope.addQuestion = function(){
                                    allQuestionAmount = allQuestionAmount + 1;        
                                    
                                    if( allQuestionAmount > 5 ){
                                        allQuestionAmount = 5;
                                    } 
                                    else{
                                        $scope.showQuestion[allQuestionAmount-1] = 1;
                                    }
                                };

                                $scope.subQuestion = function(){
                                    allQuestionAmount = allQuestionAmount - 1;
                                    
                                    if( allQuestionAmount == 0 ){
                                        allQuestionAmount = 1;
                                    }
                                    else{
                                        $scope.showQuestion[allQuestionAmount] = 0;
                                    }
                                };

                                $scope.ok = function () {   
                                    
                                    $modalInstance.close('ok');
                                };

                                $scope.cancel = function () {
                                    $modalInstance.dismiss('cancel');
                                };

                                $scope.scoreChoice = [
                                { maxScore: '1'},
                                { maxScore: '3'},
                                { maxScore: '5'},
                                { maxScore: '10'},
                                { maxScore: '100'}];

                                $scope.wordChoice = [
                                { minWords: '10'},
                                { minWords: '20'},
                                { minWords: '30'},
                                { minWords: '50'},
                                { minWords: '100'},
                                { minWords: '200'}];

                                
                                $scope.activity = {};
                                $scope.activityQuestion = {};
                                $scope.submitActivity = function(){
                                    var user = Instance.User.currentUser; 
                                    
                                    var activity = $scope.activity; 
                                    var activityCache = Instance.Activity.activities; 
                                    var promise_activity;
                                    var promise_activity_question;

                                    activity.uid = Instance.User.currentUser.uid;
                                   
                                    activity.amountOfQuestion = allQuestionAmount;

                                    var questionArray = new Array(5);

                                    var NumberOfQuestion = 0;
                                    for (NumberOfQuestion = 0 ; NumberOfQuestion < allQuestionAmount ; NumberOfQuestion++){
                                        questionArray[NumberOfQuestion] = $scope.activityQuestion[NumberOfQuestion];
                                        questionArray[NumberOfQuestion].uid = Instance.User.currentUser.uid;
                                        questionArray[NumberOfQuestion].questionNumber = NumberOfQuestion + 1 ;
                                    }

                                    var activityQuestionCache = Instance.ActivityQuestion.activityQuestions; 
                                    // promise = activityCache.createObject(activity);
                                    // promise.then(function(){
                                    //     $scope.activity = {};
                                    //     //activity創好後能夠直接頁面刷新出現activity的功能
                                    //     //$scope.safeDigest();
                                    // });
                                    //.catch($scope.handleError.bind($scope));
                                    promise_activity = activityCache.createObject(activity);
                                    promise_activity.then(function(){
                                        
                                        var NumberOfQuestion = 0;
                                        for (NumberOfQuestion = 0 ; NumberOfQuestion < allQuestionAmount ; NumberOfQuestion++){ 
                                            
                                            questionArray[NumberOfQuestion].activityId = $scope.activity.activityId;
                                            
                                            promise_activity_question = activityQuestionCache.createObject(questionArray[NumberOfQuestion]);
                                            promise_activity_question.then(function(){
                                                questionArray[NumberOfQuestion] = {};
                                                //activity創好後能夠直接頁面刷新出現activity的功能
                                                //$scope.safeDigest();
                                            });
                                        }
                                        $scope.activity = {};

                                        //activity創好後能夠直接頁面刷新出現activity的功能
                                        //$scope.safeDigest();
                                    });
                                    $modalInstance.close('submitActivity');
                                };

                            }
                        });
                        modalInstance.result.then(onOk, onDismiss);
                    };  // activityRenderModal


                    // edit activity
                    $scope.editActivity = function(activity , activityId) {    
                        $scope.editActivityRenderModal(activity ,activityId ,'lg', function() {
                            // user pressed Ok -> Do delete article!
                            //$scope.delete(article); 
                        });
                    };


                    $scope.editActivityRenderModal = function ( activity , activityId , size, onOk, onDismiss) {
                        var modalInstance = $modal.open({
                            template: ThisComponent.assets.modalEditActivityTemplate ,
                            size: size,
                            resolve: {
                                items: function () {
                                }
                            },

                            controller: function ($scope, $modalInstance, items) {


                                // initial data

                                $scope.allActivities = Instance.Activity.activities;
                                $scope.activityTitle = $scope.allActivities.indices.activityId.get(activityId).titleText;
                                $scope.activityDescription = $scope.allActivities.indices.activityId.get(activityId).descriptionText;
                                $scope.activityQuestionAmount = $scope.allActivities.indices.activityId.get(activityId).amountOfQuestion;
                                $scope.allActivityQuestions = Instance.ActivityQuestion.activityQuestions;
                                
                                $scope.allActivityQuestion = new Array(5);
                                $scope.allActivityQuestion[0] = $scope.allActivityQuestions.indices.byActivityIdAndQNumber.get(activityId,1);
                                $scope.allActivityQuestion[1] = $scope.allActivityQuestions.indices.byActivityIdAndQNumber.get(activityId,2);
                                $scope.allActivityQuestion[2] = $scope.allActivityQuestions.indices.byActivityIdAndQNumber.get(activityId,3);
                                $scope.allActivityQuestion[3] = $scope.allActivityQuestions.indices.byActivityIdAndQNumber.get(activityId,4);
                                $scope.allActivityQuestion[4] = $scope.allActivityQuestions.indices.byActivityIdAndQNumber.get(activityId,5);
                                // $scope.allActivityQuestion = $scope.allActivityQuestions.indices.byActivityId.get(activityId);
                                // console.log($scope.allActivityQuestion); 

                                $scope.showEditQuestion = {};
                                $scope.showEditQuestion[0] = 1;
                                $scope.showEditQuestion[1] = 0;
                                $scope.showEditQuestion[2] = 0;
                                $scope.showEditQuestion[3] = 0;
                                $scope.showEditQuestion[4] = 0;

                                var allQuestionAmount_old = $scope.activityQuestionAmount;
                                var allQuestionAmount_new = $scope.activityQuestionAmount;
                                
                                var showQuestionNumber = 0;
                                for (showQuestionNumber = 0 ; showQuestionNumber < allQuestionAmount_old ; showQuestionNumber++){
                                    $scope.showEditQuestion[showQuestionNumber] = 1;
                                    // alert(showQuestionNumber);
                                }

                                $scope.QuestionTitleArray = new Array(5);
                                // $scope.QuestionMaxScoreArray = new Array(5);
                                // $scope.QuestionMinWordsArray = new Array(5);
                                // $scope.QuestionNumberArray = new Array(5);
                                
                                var NumberOfQuestion = 0;
                                for (NumberOfQuestion = 0 ; NumberOfQuestion < allQuestionAmount_old ; NumberOfQuestion++){
                                    $scope.QuestionTitleArray[NumberOfQuestion] = $scope.allActivityQuestion[NumberOfQuestion].questionText;
                                    // $scope.QuestionMaxScoreArray[NumberOfQuestion] = $scope.allActivityQuestion[NumberOfQuestion].maxScore;
                                    // $scope.QuestionMinWordsArray[NumberOfQuestion] = $scope.allElevatorSpeechQuestion[NumberOfQuestion].minWords;
                                    // $scope.QuestionNumberArray[NumberOfQuestion] = $scope.allElevatorSpeechQuestion[NumberOfQuestion].questionNumber;
                                }


                                $scope.addQuestion = function(){
                                    allQuestionAmount_new = allQuestionAmount_new + 1;        
                                    
                                    if( allQuestionAmount_new > 5 ){
                                        allQuestionAmount_new = 5;
                                    } 
                                    else{
                                        $scope.showEditQuestion[allQuestionAmount_new-1] = 1;
                                    }
                                };

                                $scope.subQuestion = function(){
                                    allQuestionAmount_new = allQuestionAmount_new - 1;
                                    
                                    if( allQuestionAmount_new == 0 ){
                                        allQuestionAmount_new = 1;
                                    }
                                    else{
                                        $scope.showEditQuestion[allQuestionAmount_new] = 0;
                                    }
                                };

                                $scope.scoreChoice = [
                                { maxScore: '1'},
                                { maxScore: '3'},
                                { maxScore: '5'},
                                { maxScore: '10'},
                                { maxScore: '100'}];

                                $scope.wordChoice = [
                                { minWords: '10'},
                                { minWords: '20'},
                                { minWords: '30'},
                                { minWords: '50'},
                                { minWords: '100'},
                                { minWords: '200'}];


                                AngularUtil.decorateScope($scope);

                                $scope.ok = function () {   
                                    $modalInstance.close('ok');
                                };

                                $scope.cancel = function () {
                                    $modalInstance.dismiss('cancel');
                                };
                                

                                $scope.activity = {};
                                $scope.activityEditQuestion = {};
                                $scope.submitActivity = function(){
                                    // var user = Instance.User.currentUser; 
                                    // var activity = $scope.activity; 
                                    var activityCache = Instance.Activity.activities; 
                                    
                                    activity.titleText = $scope.activityTitle;
                                    activity.descriptionText = $scope.activityDescription;

                                    var promise; 
                                    var promise_editActivity;
                                    var promise_editActivity_question;    

                                    activity.uid = Instance.User.currentUser.uid;
                                    
                                    
                                    activity.amountOfQuestion = allQuestionAmount_new;

                                    // elevator speech question
                                    var NumberOfEditQuestion = 0;
                                    var addQuestionNumber = 1;
                                    var newQuestionArray = new Array(5);

                                    newQuestionArray[0] = {};
                                    newQuestionArray[1] = {};
                                    newQuestionArray[2] = {};
                                    newQuestionArray[3] = {};
                                    newQuestionArray[4] = {};

                                    for(NumberOfEditQuestion = 0 ; NumberOfEditQuestion  < allQuestionAmount_new ; NumberOfEditQuestion++ ){
                                        
                                        // 有新題目的判斷
                                        if(NumberOfEditQuestion >= allQuestionAmount_old){
                                            newQuestionArray[NumberOfEditQuestion].activityId = activity.activityId;
                                            newQuestionArray[NumberOfEditQuestion].uid = Instance.User.currentUser.uid;
                                            newQuestionArray[NumberOfEditQuestion].questionText = $scope.QuestionTitleArray[NumberOfEditQuestion];   
                                            
                                            // 當題目數目變多時，要有新的 questionNumber 欄位
                                            if( (allQuestionAmount_old < allQuestionAmount_new) && ( NumberOfEditQuestion >= allQuestionAmount_old ) ){ // 若題目數有增加
                                                newQuestionArray[NumberOfEditQuestion].questionNumber  = allQuestionAmount_old + addQuestionNumber;
                                                addQuestionNumber = addQuestionNumber + 1;
                                            }
                                        }
                                        else{ // 舊題目的更新
                                            $scope.allActivityQuestion[NumberOfEditQuestion].uid = Instance.User.currentUser.uid;
                                            $scope.allActivityQuestion[NumberOfEditQuestion].questionText = $scope.QuestionTitleArray[NumberOfEditQuestion];
                                            
                                        }                                        
                                    }

                                    var activityQuestion = $scope.allActivityQuestion;

                                    // 用update 幾次與 create 幾次來判斷 還要加上delete的功能
                                    // 利用old new來判斷

                                    var activityQuestionCache = Instance.ActivityQuestion.activityQuestions;

                                    // update activity
                                    promise_editActivity = activityCache.updateObject(activity);
                                    promise_editActivity.then(function(){
                                        // $scope.safeDigest();
                                    }); // .catch($scope.handleError.bind($scope));


                                    if( allQuestionAmount_old == allQuestionAmount_new ){ // 新舊題目數目相同
                                        var NumberOfEditQuestion = 0;
                                        for (NumberOfEditQuestion = 0 ; NumberOfEditQuestion < allQuestionAmount_new ; NumberOfEditQuestion++){                
                                            promise_editActivity_question = activityQuestionCache.updateObject(activityQuestion[NumberOfEditQuestion]);
                                            promise_editActivity_question.then(function(){                                    
                                            });
                                        }
                                    }
                                    else if ( allQuestionAmount_old < allQuestionAmount_new){ // 新題目的比舊題目多
                                        // 舊的更新
                                        var NumberOfEditQuestion = 0;
                                        for (NumberOfEditQuestion = 0 ; NumberOfEditQuestion < allQuestionAmount_old ; NumberOfEditQuestion++){                
                                            promise_editActivity_question = activityQuestionCache.updateObject(activityQuestion[NumberOfEditQuestion]);
                                            promise_editActivity_question.then(function(){                                    
                                            });
                                        }
                                        // 新的新增
                                        var NumberOfEditQuestion = allQuestionAmount_old;
                                        for ( NumberOfEditQuestion = allQuestionAmount_old ; NumberOfEditQuestion < allQuestionAmount_new ; NumberOfEditQuestion++){
                                            promise_editActivity_question = activityQuestionCache.createObject(newQuestionArray[NumberOfEditQuestion]);
                                            promise_editActivity_question.then(function(){
                                                newQuestionArray[NumberOfEditQuestion] = {};
                                                //activity創好後能夠直接頁面刷新出現activity的功能
                                                //$scope.safeDigest();
                                            });
                                        }
                                    }
                                    else if ( allQuestionAmount_old > allQuestionAmount_new){
                                        var NumberOfEditQuestion;
                                        // 多出來的刪除
                                        for ( NumberOfEditQuestion = allQuestionAmount_old ; NumberOfEditQuestion > allQuestionAmount_new ; NumberOfEditQuestion--){
                                            promise_editActivity_question = activityQuestionCache.deleteObject(activityQuestion[NumberOfEditQuestion-1].activityQuestionId);
                                            promise_editActivity_question.then(function(){
                                                // $scope.safeDigest();
                                            }); //.catch($scope.handleError.bind($scope));

                                        }
                                        // 舊的更新
                                        for (NumberOfEditQuestion = 0 ; NumberOfEditQuestion < allQuestionAmount_new ; NumberOfEditQuestion++){                
                                            promise_editActivity_question = activityQuestionCache.updateObject(activityQuestion[NumberOfEditQuestion]);
                                            promise_editActivity_question.then(function(){                                    
                                            });   
                                        }

                                    }

                                    $modalInstance.close('submitActivity');
                                };

                            }
                        });
                        modalInstance.result.then(onOk, onDismiss);
                    };  // editActivityRenderModal



                    // delete activity
                    $scope.deleteActivity = function(activityId) {    
                        $scope.deleteActivityRenderModal( activityId ,'md', function() {
                            // user pressed Ok -> Do delete article!
                            //$scope.delete(article); 
                        });
                    };
                    
                    $scope.deleteActivityRenderModal = function (activityId , size, onOk, onDismiss) {
                        var modalInstance = $modal.open({
                            template: ThisComponent.assets.modalDeleteActivityTemplate ,
                            size: size,
                            resolve: {
                                items: function () {
                                }
                            },

                            controller: function ($scope, $modalInstance, items) {
                                
                                $scope.allActivities = Instance.Activity.activities;
                                $scope.activityTitle = $scope.allActivities.indices.activityId.get(activityId).titleText;
                                $scope.activityQuestionAmount = $scope.allActivities.indices.activityId.get(activityId).amountOfQuestion;
                                var QuestionAmount = $scope.activityQuestionAmount;

                                $scope.allActivityQuestions = Instance.ActivityQuestion.activityQuestions;
                                $scope.allActivityQuestion = $scope.allActivityQuestions.indices.byActivityId.get(activityId);
                                var activityQuestion = $scope.allActivityQuestion;

                                var NumberOfDeleteQuestion = 0;
                                var questionIdArray = new Array(5);
                                for(NumberOfDeleteQuestion = 0; NumberOfDeleteQuestion < QuestionAmount; NumberOfDeleteQuestion++){
                                    questionIdArray[NumberOfDeleteQuestion] = $scope.allActivityQuestion[NumberOfDeleteQuestion].activityQuestionId;
                                }
                                // delete123
                                $scope.deleteActivity = function () {   
                                    $modalInstance.close('deleteActivity');
                                    var promise; 
                                    var promise_activity; 
                                    var promise_activityQuestion;

                                    promise_activity = Instance.Activity.activities.deleteObject(activityId);
                                    promise_activity.then(function(){
                                        // $scope.safeDigest();
                                    });  

                                    var NumberOfDeleteQuestion = 0;
                                    for(NumberOfDeleteQuestion = 0; NumberOfDeleteQuestion < QuestionAmount; NumberOfDeleteQuestion++){
                                        promise_activityQuestion = Instance.ActivityQuestion.activityQuestions.deleteObject(questionIdArray[NumberOfDeleteQuestion]);
                                        promise_activityQuestion.then(function(){
                                            // $scope.safeDigest();
                                        });
                                    }

                                    // until here
                                    // promise = Instance.Activity.activities.deleteObject(activityId);
                                    // promise.then(function(){
                                    //     $scope.safeDigest();
                                    // }).catch($scope.handleError.bind($scope));  
                                };

                                $scope.cancel = function () {
                                    $modalInstance.dismiss('cancel');
                                };
                            }
                        });
                        modalInstance.result.then(onOk, onDismiss);
                    };  // deleteActivityRenderModal



                }]);

                // register page
                Instance.UIMgr.registerPage(this, 'Question', this.assets.template, {
                    iconClasses: 'fa fa-question'
                });
            },

            onPageActivate: function() {//TODO Debug
                Instance.User.users.readObjects();
                Instance.Activity.activities.readObjects();
                Instance.ActivityQuestion.activityQuestions.readObjects();
                ThisComponent.page.invalidateView();
            },

            cacheEventHandlers: {
                users: {
                    updated: function(newValues, queryData, users) {
                        ThisComponent.page.invalidateView();
                    }
                },
                activities: {
                    updated: function(newValues, queryData, users) {
                        ThisComponent.page.invalidateView();
                    }
                },
                activityQuestions: {
                    updated: function(newValues, queryData, users) {
                        ThisComponent.page.invalidateView();
                    }
                }
            },
            
            /**
             * Client commands can be directly called by the host
             */
            Public: {
                
            }
        };
    })
});