var SystemJSCacheBuster = (function() {
    var systemLocate = System.locate;
    var hashTable = null;
    var loadHashTablePromise = null;
    var baseUrl = "";
    var jsonFileName = "system.cachebuster.json";

    initBaseUrl();
    patchSystemLocate();
    //monitorHashFile();

    function dumpTable() {
        console.log("SystemJS hash table");
        for(var key in hashTable) {
            console.log("    " + key + ": " + hashTable[key].hash);
        }
    }

    function initBaseUrl() {
        var baseTag = document.getElementsByTagName("base");
        if (baseTag.length) {
            baseUrl = baseTag[0].href;
        }
        else {
            baseUrl = location.origin;
            if(baseUrl[baseUrl.length-1]!="/") {
                baseUrl += "/";
            }
        }
    }

    function loadHashTable() {
        if(loadHashTablePromise) {
            return loadHashTablePromise;
        }

        return loadHashTablePromise = new Promise(function(resolve, reject) {
            var url = "/" + jsonFileName + "?v=" + new Date().valueOf();
            console.log("Loading hash table from: " + url);
            var oReq = new XMLHttpRequest();
            oReq.open("GET", url);
            oReq.send();
            oReq.addEventListener("load", function () {
                if(this.status == 200) {
                    hashTable = JSON.parse(this.responseText);
                }
                else {
                    hashTable = {};
                }

                resolve();
            });
        });
    }

    function patchSystemLocate() {
        System.locate = function (load) {
            var me = this;

            return loadHashTable().then(function() {
                return systemLocate.call(me, load).then(function (address) {
                    var url = address;

                    var relUrl = (startsWith(url, baseUrl) ? relUrl = url.substring(baseUrl.length) : url);
                    var entry = hashTable[relUrl];

                    if (entry) {
                        var cacheBuster = "?hash=" + entry.hash
                        url = url + cacheBuster;
                    }

                    console.log("System.locate: " + url);
                    return url;
                });
            });
        }
    }

    function checkHashFile() {
        $.ajax({
            type: "GET",
            url: "/system.cachebuster.json",
            dataType: "json",
            cache: false,
            success: function(newHash) {
                var modules = getModifiedModules(hashTable, newHash);

                if(modules.length) {
                    modules.forEach(function (m) {
                        if(m.indexOf(".html")!=-1) {
                            m += "!text";
                        }

                        SystemJS.normalize(m).then(function (fullName) {
                            delete SystemJS._loader.modules[fullName];

                            console.log("LOADING: " + fullName);

                            System.import(fullName).then(function (data) {
                                console.log("LOADED: " + data);
                            }).catch(function () {
                                console.error("FAILED: " + fullName);
                            });
                        });
                        // return Promise.resolve(loaderObj.normalize(name, parentName))
                        //     .then(function(name) {
                        //         var loader = loaderObj._loader;
                        //
                        //         if (loader.modules[name]) {

                    });

                    hashTable = newHash;
                }
            },
            error: function() {
                console.log("ERROR");
            }
        });
    }
    
    function monitorHashFile() {
        setInterval(function() {
            checkHashFile();
        }, 500);
    }

    function getModifiedModules(oldHash, newHash) {
        var modified = [];

        for(var module in oldHash) {
            if(newHash[module] && (oldHash[module].hash != newHash[module].hash)) {
                modified.push(module);
            }
        }

        for(var module in newHash) {
            if(!oldHash[module]) {
                modified.push(module);
            }
        }

        return modified;
    }

    function startsWith(str1, str2) {
        if (str2.length > str1.length) {
            return false;
        }

        var res = (str1.substring(0, str2.length) == str2);
        return res;
    }
    
    return {
        checkHashFile: checkHashFile,
    };
})();
