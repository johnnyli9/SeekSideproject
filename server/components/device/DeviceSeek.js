/**
 * SeekSide management
 */
"use strict";

var NoGapDef = require('nogap').Def;

module.exports = NoGapDef.component({
    Includes: [
        // add all device-only components here
    ],

    /**
     * Everything defined in `Base` is available on Host and Client.
     */
    Base: NoGapDef.defBase(function(SharedTools, Shared, SharedContext) { return {
        /**
         * 
         */
        initBase: function() {
            
        },
    };}),

    /**
     * Everything defined in `Host` lives only on the host side (Node).
     */
    Host: NoGapDef.defHost(function(SharedTools, Shared, SharedContext) { 
        return {
            __ctor: function() {
                console.log('server started (DeviceSeek)');
            },
            initHost: function() {
            },

            Private: {
                __ctor: function() {
                    this.nBlinks = 0;
                    console.log('client connected first time (DeviceSeek)');
                },

                onClientBootstrap: function() {
                }
            },
            
            /**
             * Host commands can be directly called by the client
             */
            Public: {
                blink: function(state) {
                    ++this.nBlinks;
                    console.log('client blinked ' + this.nBlinks + ' times: ' + state);

                    return Promise.delay(300)
                    .bind(this)
                    .then(function() {
                        return this.nBlinks;
                    });
                },

                // for test
                printff: function() {
                    this.client.initQuestionNumbers();
                }
            },
        };
    }),
    
    
    /**
     * Everything defined in `Client` lives only in the client (browser).
     */
    Client: NoGapDef.defClient(function(Tools, Instance, Context) {
        var ThisComponent;
        var sys;
        var exec;
        var mraa,
            serialport;

        var led13,
            ledStatus = 0;

        var analogPin2; 
        var analogValue;
        var button;
        var buttonValue; 
        var localQuestionNumbers;
        var questionCount;

        var blinkInterval = 1000;

        
        return {
            __ctor: function() {
                ThisComponent = this;
                sys = require('sys');
                exec = require('child_process').exec;
                mraa = require('mraa');
            },

            startSeeking: function(device) {
                console.log('Start seeking...');

                analogPin2 = new mraa.Aio(2); //setup access analog inpuput pin 0
                analogValue = analogPin2.read(); //read the value of the analog pin
                button = new mraa.Gpio(13);
                button.dir(mraa.DIR_IN);
                
                //this.detectRotary();

                // led13 = new mraa.Gpio(13);
                // led13.dir(mraa.DIR_OUT);
                
                // this.blinkLed();

                // var a = this.Instance.DeviceMain.getCurrentDevice().hostName;
                // console.log(a);
            },

            detectRotary: function() {
                if(questionCount < localQuestionNumbers){
                    analogValue = analogPin2.read();
                    buttonValue = button.read();
                    
                    console.log("rotary:"+ analogValue); //write the value of the analog pin to the console
                    console.log("button:"+ buttonValue);

                    if(buttonValue){
                        this.submitButton(analogValue,buttonValue);
                    }
                    else{
                        this.redetectRotary = setTimeout(this.detectRotary.bind(this), 100);
                    }
                }
                else{
                    // 傳所有問題的結果
                }
            },

            submitButton: function(analogValue, buttonValue) {
                console.log("rotary value:" + analogValue);
                console.log("button value:"+ buttonValue);
                // questionCount++;
                // 存回應
                var obj = {};
                obj.deviceId = 3;
                obj.activityId = 1;
                obj.questionNumber = ++questionCount;
                obj.answer = analogValue;

                Instance.DeviceResponse.responses.recieveAnswer(obj);

                // this.detectRotary();

            },

            setLedStatus: function(status) {
                ledStatus = status;
                led13.write(status);
            },

            blinkLed: function() {
                this.setLedStatus(1 - ledStatus);
                
                this.host.blink(ledStatus)
                .then(function(nBlinks) {
                    console.log('Server said, we blinked ' + nBlinks + ' times.');
                });

                this.ledTimer = setTimeout(this.blinkLed.bind(this), blinkInterval);
            },

            stopBlinking: function() {
                if (this.ledTimer) {
                    clearTimeout(this.ledTimer);
                    this.ledTimer = null;
                }
            },


            /**
             * Client commands can be directly called by the host
             */
            Public: {
                // for test
                printffclient: function() {
                    console.log("DeviceSeek.client.public.printff is called.");
                },

                // send question numbers to device 
                initQuestionNumbers: function(questionNumbers) {
                    localQuestionNumbers = questionNumbers;
                    questionCount = 0;
                    this.detectRotary();
                }
            }
        };
    })
});
