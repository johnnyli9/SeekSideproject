// TODO: Separate between user-dependent and default config
"use strict";

module.exports = {

    // ########################################################################################################################
    // Device config

    'deviceConfigDefaults': {
        'CookiesFile': './data/cookies.json',
        'HostIdentityTokenFile': './data/hostIdentityToken',
        'DeviceClientCacheFile': './data/deviceClientCache.min.js',
        'DeviceEntryCacheFile': './data/deviceEntryCache.json',
        'ReconnectDelay': '5000'           // a few seconds
    },

    'deviceDefaultResetTimeout': 60 * 1000,// a few minutes

    'deviceImage': {
        'downloadPath': '/Download/DeviceImage',

        // absolute file path
        'filePath': __dirname + '/data/DeviceImage.img'
    },

    'deviceHostNamePrefix': 'dv-one-dev-',


    // ########################################################################################################################
    // Frontend options

    /**
     * How often to refetch data from server by default
     */
    'defaultPageRefreshDelay': 10000,

    'scannerTimeFrameSeconds': 90,



    // ########################################################################################################################
    // User feature locks

    /**
     * Whether new users may still register
     */
    'registrationLocked': 0,

    /**
     * Whether non-priviliged users can currently login
     */
    'loginLocked': 0,



    // ########################################################################################################################
    // Developer feature locks

    /**
     * Whether developer options are enabled
     */
    'dev': 1,

    // ########################################################################################################################
    // Host + networking settings

    /**
     * Host name or IP that external clients can connect to
     */

    'externalHost': '192.168.11.11',

    'hosts': ['192.168.11.11'],
    // 'externalHost': 'localhost',
    // 'hosts': ['localhost'],

    // 'externalHost': '10.0.1.26',
    // 'hosts': ['10.0.1.26'],



    // ########################################################################################################################
    // Other misc settings

    /**
     * Use this locale on the server and for new clients who did not submit a preference
     */
    'defaultLocale': 'en',

    // ########################################################################################################################
    // Facebook settings

    // Test FB App settings
    'facebookAppID': '392918107554514',
    'facebookAppSecret': '4ecaef98a8828386f5e2260e03f4a685',
    

    // ########################################################################################################################
    // Developer options

    /**
     * Whether to open the command line
     */
    'console': 0,

    /**
     * Whether to trace RPC calls on Host side
     */
    'traceHost': {
        'enabled': 1,
        'blackList': {
            'functions': {
                'DeviceCommunications.checkIn': 1,
                'LivePage.getMostRecentPackets': 1,
                'DeviceCapture.storePacket': 1, 
                'DeviceStatus.getDeviceLastActiveTimes': 1,
                'CommonDBQueries.executeQuery': 1,
                'DeviceLog.logDeviceErrors': 1,
                'DeviceCapture.storePacket2': 1
            },
            'components': {

            }
        }
    },

    /**
     * Whether to trace RPC calls on Client side
     */
    'traceClient': {
        'enabled': 1,
        'blackList': {
            'functions': {
                'DeviceCommunications.host.checkIn': 1,
                'LivePage.host.getMostRecentPackets': 1,
                'DeviceCapture.storePacket': 1,
                'RawPage.host.getMostRecentPackets': 1,
                'DeviceStatus.host.getDeviceLastActiveTimes': 1,
                'CommonDBQueries.host.executeQuery': 1,
                'DeviceLog.host.logDeviceErrors': 1
            },
            'components': {
                
            }
        }
    },


    // ########################################################################################################################
    // Mostly constant options

    'title': 'SeekSide',

    // folder containing files, accessible by clients
    'uploadFolder': 'uploads/',

    // Connection & transport parameters
    'httpd': {
        /**
         * The port of the application
         */
        'port'     : '3000'
    },

    // these are the login details to connect to your MySQL DB
    'db' : {
        'host'     : 'localhost',
        'user'     : 'root',
        'password' : '',
        'port'     : '3306',
        'database' : 'seeksideDB',
        'reconnectDelay':   '5'
    },

    // logging configuration
    'logging' : {
        'defaultFile' : '_log/app.log',
        'dbFile' : '_log/db.log',
        'userFile': '_log/user.log',
    },

    // session configuration
    'session' : {
        // For more information, read: http://blog.teamtreehouse.com/how-to-create-totally-secure-cookies
        // session persists for 1 month:
        'lifetime' : 1000 * 60 * 60 * 24 * 30 * 1,
        
        // make sure to set the domain to disable sub-domains from getting your cookies!
        // domain can include the port
        // TODO: Support multiple domains
        'domain'   : undefined,
        
        // If there are multiple websites on the same domain, specify which part of the path is dedicated for this application
        'path'     : '/',

        // Max age in milliseconds. This tells the browser to keep the cookie.
        'maxAge'   : 1000 * 60 * 60 * 24 * 30 * 1
    },

    // NoGap component and application configuration
    'nogap': {
        'maxCommandsPerRequest': 0,
        
        'logging'      : {
            'verbose'   : 1
        },
        'longstacktraces': true,
        'lazyLoad'     : true,
        'baseFolder'   : 'components',

        // localizer and language parameters
        'localizer': {
            'folder': 'lang',
            'defaultLang' : 'en'
        },

        /**
         * WARNING: Do not randomly change the order of these files.
         *      Some components do not gracefully resolve dependencies (yet).
         */
        'files'        : [
            // core utilities (need to initialize first, for now)
            'util/RuntimeError',
            'util/CacheUtil',

            // core components
            'models/core/AppConfig',
            'models/core/User',

            'models/question/Activity',
            'models/question/ActivityQuestion',

            'models/group/Match',

            // all kinds of model components
            'models/devices/Device',
            'models/devices/DeviceStatus',
            'models/devices/DeviceResponse',
            'models/devices/DeviceResult',

            // misc utilities
            'util/Auth',
            'util/MiscUtil',
            'util/Localizer',
            'util/Log',
            'util/ValidationUtil',
            'util/FacebookApi',
            'util/SMTP',
            
            // this one kicks off Instance code
            'Main',

            // core UI components:
            'ui/UIMgr',
            'ui/UIMain',

            // core device components:
            'device/DeviceMain',
            'device/DeviceSeek',

            // guest + unregistered pages:
            'ui/login/LoginPage',

            // user pages:
            'ui/home/HomePage',
            'ui/device/DevicePage',
            'ui/account/AccountPage',
            'ui/question/QuestionPage',
            'ui/showQuestion/ShowQuestionPage',

            // superuser pages:
            'ui/admin/AdminPage'
        ]
    },
};
