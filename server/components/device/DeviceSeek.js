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

                // led13 = new mraa.Gpio(13);
                // led13.dir(mraa.DIR_OUT);
                
                // this.blinkLed();

                var a = this.Instance.DeviceMain.getCurrentDevice().hostName;
                console.log(a);
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
