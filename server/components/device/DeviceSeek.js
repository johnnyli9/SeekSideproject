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
                },

                // check alike
                checkAlike: function(targetDeviceId, selfDeviceId, activityId) {
                    
                    // this.Instance.DeviceResult.client.testtt();
                    var result = this.Instance.DeviceResult.client.compareTwoDevice(targetDeviceId, selfDeviceId, activityId);
                    // var tttt = ThisComponent.Instance.DeviceResult.results.indices.deviceId.get("3");
                    // console.log(tttt[0]);
                    // var result = 0.8;
                    // var result = 5;
                    
                    // 拿到比對結果後得到相似程度值
                    Promise.delay(100)
                    .bind(this)
                    .then(function() {
                        console.log(result);
                        // this.client.callAlike(result,targetDeviceId);
                    });

                    // return Promise.delay(500)
                    // .bind(this)
                    // .then(function() {
                    //     return Shared.Match.host.waitForDeviceDecideGoup();
                    // });
                    
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

        var ledRedPin,
            ledYellowPin,
            ledGreenPin,
            ledBluePin;

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
        var localTargetDeviceId;
        var defineStateCount,defineStateCount2;
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
                soundPin6 = new mraa.Gpio(6); //setup access digital input pin 6 (Pwm)
                soundPin6.dir(mraa.DIR_OUT);

                // led initial
                ledRedPin = new mraa.Gpio(12); //setup access digital input pin 6 (Pwm)
                ledRedPin.dir(mraa.DIR_OUT);
                ledYellowPin = new mraa.Gpio(7); //setup access digital input pin 6 (Pwm)
                ledYellowPin.dir(mraa.DIR_OUT);
                ledGreenPin = new mraa.Gpio(4); //setup access digital input pin 6 (Pwm)
                ledGreenPin.dir(mraa.DIR_OUT);
                ledBluePin = new mraa.Gpio(5); //setup access digital input pin 6 (Pwm)
                ledBluePin.dir(mraa.DIR_OUT);


                localDeviceId = this.Instance.DeviceMain.getCurrentDevice().deviceId;
                
                console.log("Waiting for Host send question numbers....");
                // this.playSound();
                //this.detectRotary();

                // led13 = new mraa.Gpio(13);
                // led13.dir(mraa.DIR_OUT);
                
                // this.blinkLed();

                // var a = this.Instance.DeviceMain.getCurrentDevice().hostName;
                // console.log(a);
            },

            detectRotary: function() {
                if(questionCount < localQuestionNumbers){
                    analogValue = Math.floor(analogPin2.read() / 200) + 1;
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
                        obj.result = obj.result + localResult[i];
                    };
                    // obj.result = ;
                    obj.isGroup = 0;
                    obj.groupId = null;
                    // send DeviceResponse to server then save to DB
                    console.log("saving DeviceResult....");
                    Instance.DeviceResult.receiveDeviceResult(obj);
                    this.matchingState();
                    // this.host.checkAlike(2,localDeviceId,localActivityId);
                    // var tttt = {};
                    // tttt = Instance.DeviceResult.results.indices.resultId.get("3");
                    // console.log(tttt.activityId);
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
                    Promise.delay(250)
                        .bind(this)
                        .then(function() {
                          soundValue = 0;
                          soundPin6.write(soundValue);
                          // console.log(soundValue);
                        });
                    // console.log(soundValue);
                    localSoundTimes++;
                    console.log("sound:" + localSoundTimes);
                    this.replaySound = setTimeout(this.playSound.bind(this), 500);
                }
                else{
                    console.log("play sound finish");
                    
                    this.defineState();
                }
            },

            matchingState: function() {
                // this state is called by server
                // console.log("set");
                if(localResult[0]){

                    switch(localResult[0]){
                    case 1:
                        console.log("light red");
                        ledRedPin.write(1);
                        // this.blinkLed();
                        break;
                    case 2:
                        console.log("light yellow");
                        ledYellowPin.write(1);
                        // this.blinkLed();
                        break;
                    case 3:
                        console.log("light green");
                        ledGreenPin.write(1);
                        // this.blinkLed();
                        break;
                    case 4:
                        console.log("light blue");
                        ledBluePin.write(1);
                        // this.blinkLed();          
                        break;
                    default:
                        // shouldn't happen
                        console.log("error");
                    }
                }
                this.nfcDetect();            

            },
            nfcDetect: function() {
                // nfc mode read other deviceId
                // if detect call server to test alike


                console.log("enter nfcDetect");

                // Load PN532 module
                var pn532 = require('jsupm_pn532');

                // Instantiate an PN532 on I2C bus 0 (default) using gpio 3 for the
                // IRQ, and gpio 2 for the reset pin.
                var myNFCObj = new pn532.PN532(3, 2);

                if (!myNFCObj.init())
                    console.log("init() failed");

                var vers = myNFCObj.getFirmwareVersion();

                if (vers)
                    console.log("Got firmware version: " + toHex(vers, 8));
                else
                {
                    console.log("Could not identify PN532");
                    exit();
                }

                // Now scan and identify any cards that come in range (1 for now)

                // Retry forever
                myNFCObj.setPassiveActivationRetries(0xff);

                myNFCObj.SAMConfig();

                var uidSize = new pn532.uint8Array(0);
                var uid = new pn532.uint8Array(7);

                var myInterval = setInterval(function()
                {
                    for (var x = 0; x < 7; x++)
                        uid.setitem(x, 0);
                    if (myNFCObj.readPassiveTargetID(pn532.PN532.BAUD_MIFARE_ISO14443A,
                                                 uid, uidSize, 2000))
                    {
                        // found a card
                        console.log("Found a card: UID len " + uidSize.getitem(0));
                        process.stdout.write("UID: ");
                        for (var i = 0; i < uidSize.getitem(0); i++)
                                {
                                        var byteVal = uid.getitem(i);
                            process.stdout.write(toHex(byteVal, 2) + " ");
                                }
                        process.stdout.write("\n");
                        console.log("SAK: " + toHex(myNFCObj.getSAK(), 2));
                        console.log("ATQA: " + toHex(myNFCObj.getATQA(), 4));
                        console.log(" ");
                        // ThisComponent.ttt();
                        clearInterval(myInterval);
                        ThisComponent.ttt();
                    }
                    else
                        console.log("Waiting for a card...");
                }, 1000);

                // ThisComponent.ttt();

                function toHex(d, pad)
                {
                    // pad should be between 1 and 8
                    return  ("00000000"+(Number(d).toString(16))).slice(-pad)
                }

                function exit()
                {
                    clearInterval(myInterval);
                    myNFCObj = null;
                    pn532.cleanUp();
                    pn532 = null;
                    console.log("Exiting");
                    process.exit(0);
                }

                // When exiting: clear interval, and print message
                process.on('SIGINT', function()
                {
                    exit();
                });
                
                // var targetDeviceId = 5;
                // this.host.checkAlike(targetDeviceId, localDeviceId, localActivityId);
            },

            ttt: function(){
                console.log("ddd");
                var targetDeviceId = 5;
                this.host.checkAlike(targetDeviceId, localDeviceId, localActivityId);
            },

            alike: function(result, targetDeviceId){
                // react buzz times
                localSoundTimes = 0;
                soundTimes = result;
                localTargetDeviceId = targetDeviceId;
                defineStateCount = 0;
                defineStateCount2 = 0;
                console.log(soundTimes);
                this.playSound();
                // decide group or not
                // this.defineState(targetDeviceId);

                
            },

            defineState: function() {
                //  使用者決定是否group
                console.log("defineState enter");
                
                if(localTargetDeviceId > localDeviceId){
                        // detect mode
                            buttonValue = button.read();
                            console.log("button" + buttonValue);
                            defineStateCount2++;
                            if(buttonValue){
                                defineStateCount++;        
                            }
                            if(defineStateCount >= 9){
                                console.log("defineStateCount====" + defineStateCount);
                                this.sender(localTargetDeviceId);
                            }else if(defineStateCount2 < 18){
                                this.redefinState = setTimeout(this.defineState.bind(this), 500);
                            }else if(defineStateCount2 >= 18){
                                console.log("back to nfcdetect mode");
                                this.nfcDetect();
                            }
                    
                }
                else{
                    console.log("wait for call receiver");
                    Promise.delay(8000)
                    .then(function() {
                        console.log("end waiting back to nfc mode");
                        this.nfcDetect();
                        //  多少時間經過後沒有反應則重新回到nfc mode            
                    });
                }
            },

            sender: function(targetDeviceId) {
                this.Instance.Match.matchAction(targetDeviceId, localDeviceId, localActivityId);
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

                callAlike: function(result, targetDeviceId) {
                    this.alike(result, targetDeviceId);
                },
                backToNfc: function(){
                    this.nfcDetect();
                },

                matchDone: function() {

                        ledRedPin.write(1);                  
                        ledYellowPin.write(1);
                        ledGreenPin.write(1);
                        ledBluePin.write(1);
                        
                        Promise.delay(10000)
                        .then(function() {
                            ledRedPin.write(0);                  
                            ledYellowPin.write(0);
                            ledGreenPin.write(0);
                            ledBluePin.write(0);
                        
                        });
                    
                },

                receiver: function(myselfId, callById, activityId) {
                    // var buttonHold = 0;
                    // for (var i = 0; i < 10; i++) {
                    //     buttonValue = button.read();
                    //     if(buttonValue){
                    //         buttonHold++;
                    //         console.log(buttonHold);
                    //     }
                    //     if(i == 9){
                    //         return true;
                    //     }
                    // };
                    var receiverCount = 0;

                    console.log("enter receiver");

                    Promise.delay(500)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(1000)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(1500)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(2000)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(2500)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(3000)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(3500)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(4000)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(4500)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(5000)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(5500)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(6000)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(6500)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(7000)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(7500)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(8000)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(8500)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(9000)
                    .then(function() {
                        buttonValue = button.read();
                        console.log("button" + buttonValue);
                        if(buttonValue){
                            receiverCount++;        
                        }          
                    });
                    Promise.delay(9500)
                    .bind(this)
                    .then(function() {
                        if(receiverCount >= 9){
                            this.Instance.Match.host.catchReceiver(true, myselfId, callById, activityId);
                        }
                        else{
                            console.log("back to nfc mode");
                            this.Instance.Match.host.catchReceiver(false, myselfId, callById, activityId);
                            this.nfcDetect();
                            // back to nfc mode
                        }
                    });

                    
                    
                }


            }
        };
    })
});
