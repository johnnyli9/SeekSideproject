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
        var analogPin0,
            analogValue,
            digitalPin0,
            digitalValue;

        var led13,
            ledStatus = 0;

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
                analogPin0 = new mraa.Aio(2); //setup access analog inpuput pin 0
                analogValue = analogPin0.read(); //read the value of the analog pin
                // led13 = new mraa.Gpio(13);
                // led13.dir(mraa.DIR_OUT);
                digitalPin0 = new mraa.Gpio(13);
                digitalPin0.dir(mraa.DIR_IN);
                digitalValue = digitalPin0.read();

                // this.blinkLed();
                this.detectRotary();

                // var a = this.Instance.DeviceMain.getCurrentDevice().hostName;
                // console.log(a);
            },

            detectRotary: function(){
                analogValue = analogPin0.read();
                digitalValue = digitalPin0.read();
                // console.log(analogValue); //write the value of the analog pin to the console
                console.log("button:"+digitalValue);
                // if(analogValue<thresholdvalue){
                //     myLed.write(1);
                // }
                // else{
                //     myLed.write(0);
                // }
                this.re = setTimeout(this.detectRotary.bind(this),200);
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
                
            }
        };
    })
});
