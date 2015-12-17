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

                // check alike
                // checkAlike: function(targetDeviceId, selfDeviceId) {
                //     // 
                // }
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
        var soundPin6;
        var soundValue;
        var localQuestionNumbers;
        var localActivityId;
        var localResult = [];
        var localDeviceId;
        var localSoundTimes;
        var soundTimes;
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
                console.log('Start SeekSide initial...');

                // rotary initial
                analogPin2 = new mraa.Aio(2); //setup access analog inpuput pin 2
                analogValue = analogPin2.read(); //read the value of the analog pin
                
                // button initial
                button = new mraa.Gpio(8);
                button.dir(mraa.DIR_IN);
                
                // buzzer initial
                soundPin6 = new mraa.Gpio(3); //setup access digital input pin 6 (Pwm)
                soundPin6.dir(mraa.DIR_OUT);

                localDeviceId = this.Instance.DeviceMain.getCurrentDevice().deviceId;
                
                console.log("Waiting for Host send question numbers....");
                // this.playSound();
                //this.detectRotary();

                led13 = new mraa.Gpio(13);
                led13.dir(mraa.DIR_OUT);
                
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
                        localResult[questionCount] = analogValue;
                        this.submitButton(analogValue,buttonValue); 
                    }
                    else{
                        this.redetectRotary = setTimeout(this.detectRotary.bind(this), 100);
                    }
                }
                else{
                    // 傳所有問題的結果
                    var obj = {};
                    obj.deviceId = localDeviceId;
                    obj.activityId = localActivityId;
                    obj.result = "";
                    for (var i = 0 ; i < localResult.length ; i++) {
                        obj.result = obj.result + localResult[0];
                    };
                    // obj.result = ;
                    obj.isGroup = 0;
                    obj.groupId = null;
                    // send DeviceResponse to server then save to DB
                    console.log("saving DeviceResult....");
                    Instance.DeviceResult.receiveDeviceResult(obj);
                    this.matchingState();

                    // enter to find match state

                }
            },

            submitButton: function(analogValue, buttonValue) {
                console.log("rotary value:" + analogValue);
                console.log("button value:"+ buttonValue);
                // questionCount++;
                // 存回應
                var obj = {};
                obj.deviceId = localDeviceId;
                obj.activityId = localActivityId;
                obj.questionNumber = ++questionCount;
                obj.answer = analogValue;

                // 不知道需不需要等待
                // send DeviceResponse to server then save to DB
                console.log("saving DeviceResponse....");
                Instance.DeviceResponse.receiveDeviceResponse(obj);

                // GAP State
                this.gapState();
                

            },

            gapState: function() {
                buttonValue = button.read();
                console.log("gapState button value:" + buttonValue);
                

                if(!buttonValue){
                    this.detectRotary();
                }

                else{
                    this.regapState = setTimeout(this.gapState.bind(this), 100);
                }
            },

            playSound: function() {
                if(localSoundTimes < soundTimes){
                    soundValue = 1;
                    soundPin6.write(soundValue);
                    Promise.delay(500)
                        .bind(this)
                        .then(function() {
                          soundValue = 0;
                          soundPin6.write(soundValue);
                          // console.log(soundValue);
                        });
                    // console.log(soundValue);
                    localSoundTimes++;
                    console.log("sound:" + localSoundTimes);
                    this.replaySound = setTimeout(this.playSound.bind(this), 1000);
                }
                else{
                    console.log("play sound finish");
                }
            },

            matchingState: function() {
                // this state is called by server
                // console.log("set");
                if(localResult[0])
                switch(localResult[0]){
                case 1:
                    console.log("light 1111111");
                    // this.setLedStatus(1);
                    // this.blinkLed();
                    break;
                case 2:
                    console.log("light 2222222");
                    // this.setLedStatus(1);
                    // this.blinkLed();
                    break;
                case 3:
                    console.log("light 3333333");
                    // this.setLedStatus(1);
                    // this.blinkLed();
                    break;
                case 4:
                    console.log("light 4444444");
                    // this.setLedStatus(1);
                    // this.blinkLed();          
                    break;
                default:
                    // shouldn't happen
                    console.log("error");
                }
                this.alike(5);
                
                
                // nfc mode read other deviceId
                
                // call sever to decide match correct or not
                // this.host.checkAlike(targetDeviceId, localDeviceId);


            },

            alike: function(data){
                // react buzz times
                localSoundTimes = 0;
                soundTimes = data;
                this.playSound();
                // decide group or not

                
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

                // send question numbers & activityID to device 
                initQuestionNumbers: function(questionNumbers, activityId) {
                    localQuestionNumbers = questionNumbers;
                    localActivityId = activityId;
                    questionCount = 0;
                    this.detectRotary();
                },

                // callAlike: function(data) {
                //     this.alike();
                // }
            }
        };
    })
});
