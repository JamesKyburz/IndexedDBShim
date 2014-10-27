/*jshint globalstrict: true*/
'use strict';
(function(window, idbModules){
    if (typeof window.openDatabase !== "undefined") {
        window.shimIndexedDB = idbModules.shimIndexedDB;
        if (window.shimIndexedDB) {
            window.shimIndexedDB.__useShim = function(){
                window.IDBDatabase = idbModules.IDBDatabase;
                window.IDBTransaction = idbModules.IDBTransaction;
                window.IDBCursor = idbModules.IDBCursor;
                window.IDBKeyRange = idbModules.IDBKeyRange;
                try {
                  window.indexedDB = idbModules.shimIndexedDB;
                  // On some browsers the assignment fails, overwrite with the defineProperty method
                  if (window.indexedDB !== idbModules.shimIndexedDB && Object.defineProperty) {
                      Object.defineProperty(window, 'indexedDB', {
                          value: idbModules.shimIndexedDB
                      });
                  }
                } catch(e) {
                  window._indexedDB = idbModules.shimIndexedDB;
                }
            };
            window.shimIndexedDB.__debug = function(val){
                idbModules.DEBUG = val;
            };
        }
    }
    
    /*
    prevent error in Firefox
    */

    if(!('indexedDB' in window)) {
        window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.oIndexedDB || window.msIndexedDB;
    }
    
    /*
    detect browsers with known IndexedDb issues (e.g. Android pre-4.4)
    */
    var poorIndexedDbSupport = false;
    if (navigator.userAgent.match(/Android 2/) || navigator.userAgent.match(/Android 3/) || navigator.userAgent.match(/Android 4\.[0-3]/)) {
        /* Chrome is an exception. It supports IndexedDb */
        if (!navigator.userAgent.match(/Chrome/)) {
            poorIndexedDbSupport = true;
        }
    } else if((navigator.userAgent.match(/Safari/) && !navigator.userAgent.match(/Chrome/)) ||
      navigator.userAgent.match(/Version\/8\.0[\.0-9]* Safari\//) ||
      navigator.userAgent.match(/Version\/7\.1[\.0-9]* Safari\//) ||
      navigator.userAgent.match(/\(iPad; CPU OS 8_/) ||
      navigator.userAgent.match(/\(iPhone; CPU OS 8_/)) {
      /*
      Right now I am matching all version of Safari because there are 3 know bugs and no time line in place when any will be resolved

      Safari for Mac version 7.1 (9537.85.10.17.1), 8.0 and Mobile Safari version for iOS 8, 8.0.1, and 8.0.2 all have
          a known bug for removing items from indexeddb objectStores that have the same id as items in other objectStores.
          This makes these version unusable.  See: http://www.raymondcamden.com/2014/9/25/IndexedDB-on-iOS-8--Broken-Bad
          Once a working version is released this userAgent match should be updated to only match these affect versions.
       */
       poorIndexedDbSupport = true;
    }

    if ((typeof window.indexedDB === "undefined" || poorIndexedDbSupport) && typeof window.openDatabase !== "undefined" || window.indexedDB === null) {
        window.shimIndexedDB.__useShim();
    }
    else {
        window.IDBDatabase = window.IDBDatabase || window.webkitIDBDatabase;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
        window.IDBCursor = window.IDBCursor || window.webkitIDBCursor;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
        if(!window.IDBTransaction){
            window.IDBTransaction = {};
        }
        /* Some browsers (e.g. Chrome 18 on Android) support IndexedDb but do not allow writing of these properties */
        try {
            window.IDBTransaction.READ_ONLY = window.IDBTransaction.READ_ONLY || "readonly";
            window.IDBTransaction.READ_WRITE = window.IDBTransaction.READ_WRITE || "readwrite";
        } catch (e) {}
    }
    
}(window, idbModules));

