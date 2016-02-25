//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Retry = Package.retry.Retry;
var DDP = Package['ddp-client'].DDP;
var Mongo = Package.mongo.Mongo;
var _ = Package.underscore._;
var HTTP = Package.http.HTTP;
var Random = Package.random.Random;

/* Package-scope variables */
var ClientVersions, Autoupdate;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/autoupdate/autoupdate_cordova.js                                                                    //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
var DEBUG_TAG = 'METEOR CORDOVA DEBUG (autoupdate_cordova.js) ';                                                // 1
var log = function (msg) {                                                                                      // 2
  console.log(DEBUG_TAG + msg);                                                                                 // 3
};                                                                                                              // 4
                                                                                                                // 5
// This constant was picked by testing on iOS 7.1                                                               // 6
// We limit the number of concurrent downloads because iOS gets angry on the                                    // 7
// application when a certain limit is exceeded and starts timing-out the                                       // 8
// connections in 1-2 minutes which makes the whole HCP really slow.                                            // 9
var MAX_NUM_CONCURRENT_DOWNLOADS = 30;                                                                          // 10
var MAX_RETRY_COUNT = 5;                                                                                        // 11
                                                                                                                // 12
var autoupdateVersionCordova = __meteor_runtime_config__.autoupdateVersionCordova || "unknown";                 // 13
                                                                                                                // 14
// The collection of acceptable client versions.                                                                // 15
ClientVersions = new Mongo.Collection("meteor_autoupdate_clientVersions");                                      // 16
                                                                                                                // 17
Autoupdate = {};                                                                                                // 18
                                                                                                                // 19
Autoupdate.newClientAvailable = function () {                                                                   // 20
  return !! ClientVersions.findOne({                                                                            // 21
    _id: 'version-cordova',                                                                                     // 22
    version: {$ne: autoupdateVersionCordova}                                                                    // 23
  });                                                                                                           // 24
};                                                                                                              // 25
                                                                                                                // 26
var writeFile = function (directoryPath, fileName, content, cb) {                                               // 27
  var fail = function (err) {                                                                                   // 28
    cb(new Error("Failed to write file: ", err), null);                                                         // 29
  };                                                                                                            // 30
                                                                                                                // 31
  window.resolveLocalFileSystemURL(directoryPath, function (dirEntry) {                                         // 32
    var success = function (fileEntry) {                                                                        // 33
      fileEntry.createWriter(function (writer) {                                                                // 34
        writer.onwrite = function (evt) {                                                                       // 35
          var result = evt.target.result;                                                                       // 36
          cb(null, result);                                                                                     // 37
        };                                                                                                      // 38
        writer.onerror = fail;                                                                                  // 39
        writer.write(content);                                                                                  // 40
      }, fail);                                                                                                 // 41
    };                                                                                                          // 42
                                                                                                                // 43
    dirEntry.getFile(fileName, {                                                                                // 44
      create: true,                                                                                             // 45
      exclusive: false                                                                                          // 46
    }, success, fail);                                                                                          // 47
  }, fail);                                                                                                     // 48
};                                                                                                              // 49
                                                                                                                // 50
var restartServer = function (location) {                                                                       // 51
  log('restartServer with location ' + location);                                                               // 52
  var fail = function (err) { log("Unexpected error in restartServer: " + err.message) };                       // 53
  var httpd = cordova && cordova.plugins && cordova.plugins.CordovaUpdate;                                      // 54
                                                                                                                // 55
  if (! httpd) {                                                                                                // 56
    fail(new Error('no httpd'));                                                                                // 57
    return;                                                                                                     // 58
  }                                                                                                             // 59
                                                                                                                // 60
  var startServer = function (cordovajsRoot) {                                                                  // 61
    httpd.startServer({                                                                                         // 62
      'www_root' : location,                                                                                    // 63
      'cordovajs_root': cordovajsRoot                                                                           // 64
    }, function (url) {                                                                                         // 65
      if (Package.reload) {                                                                                     // 66
        Package.reload.Reload._reload();                                                                        // 67
      } else {                                                                                                  // 68
        window.location.reload();                                                                               // 69
      }                                                                                                         // 70
    }, fail);                                                                                                   // 71
  };                                                                                                            // 72
                                                                                                                // 73
  httpd.getCordovajsRoot(function (cordovajsRoot) {                                                             // 74
    startServer(cordovajsRoot);                                                                                 // 75
  }, fail);                                                                                                     // 76
};                                                                                                              // 77
                                                                                                                // 78
var hasCalledReload = false;                                                                                    // 79
var updating = false;                                                                                           // 80
var localPathPrefix = null;                                                                                     // 81
                                                                                                                // 82
var onNewVersion = function () {                                                                                // 83
  var ft = new FileTransfer();                                                                                  // 84
  var urlPrefix = Meteor.absoluteUrl() + '__cordova';                                                           // 85
  HTTP.get(urlPrefix + '/manifest.json', function (err, res) {                                                  // 86
    if (err || ! res.data) {                                                                                    // 87
      log('Failed to download the manifest ' + (err && err.message) + ' ' + (res && res.content));              // 88
      return;                                                                                                   // 89
    }                                                                                                           // 90
                                                                                                                // 91
    updating = true;                                                                                            // 92
    ensureLocalPathPrefix(_.bind(downloadNewVersion, null, res.data));                                          // 93
  });                                                                                                           // 94
};                                                                                                              // 95
                                                                                                                // 96
var downloadNewVersion = function (program) {                                                                   // 97
  var urlPrefix = Meteor.absoluteUrl() + '__cordova';                                                           // 98
  var manifest = _.clone(program.manifest);                                                                     // 99
  var version = program.version;                                                                                // 100
  var ft = new FileTransfer();                                                                                  // 101
                                                                                                                // 102
  manifest.push({ url: '/index.html?' + Random.id() });                                                         // 103
                                                                                                                // 104
  var versionPrefix = localPathPrefix + version;                                                                // 105
                                                                                                                // 106
  var queue = [];                                                                                               // 107
  _.each(manifest, function (item) {                                                                            // 108
    if (! item.url) return;                                                                                     // 109
                                                                                                                // 110
    var url = item.url;                                                                                         // 111
    url = url.replace(/\?.+$/, '');                                                                             // 112
                                                                                                                // 113
    queue.push(url);                                                                                            // 114
  });                                                                                                           // 115
                                                                                                                // 116
  var afterAllFilesDownloaded = _.after(queue.length, function () {                                             // 117
    var wroteManifest = function (err) {                                                                        // 118
      if (err) {                                                                                                // 119
        log("Failed to write manifest.json: " + err);                                                           // 120
        // XXX do something smarter?                                                                            // 121
        return;                                                                                                 // 122
      }                                                                                                         // 123
                                                                                                                // 124
      // success! downloaded all sources and saved the manifest                                                 // 125
      // save the version string for atomicity                                                                  // 126
      writeFile(localPathPrefix, 'version', version, function (err) {                                           // 127
        if (err) {                                                                                              // 128
          log("Failed to write version: " + err);                                                               // 129
          return;                                                                                               // 130
        }                                                                                                       // 131
                                                                                                                // 132
        // don't call reload twice!                                                                             // 133
        if (! hasCalledReload) {                                                                                // 134
          var location = uriToPath(localPathPrefix + version);                                                  // 135
          restartServer(location);                                                                              // 136
        }                                                                                                       // 137
      });                                                                                                       // 138
    };                                                                                                          // 139
                                                                                                                // 140
    writeFile(versionPrefix, 'manifest.json',                                                                   // 141
              JSON.stringify(program, undefined, 2), wroteManifest);                                            // 142
  });                                                                                                           // 143
                                                                                                                // 144
  var downloadUrl = function (url) {                                                                            // 145
    console.log(DEBUG_TAG + "start downloading " + url);                                                        // 146
    // Add a cache buster to ensure that we don't cache an old asset.                                           // 147
    var uri = encodeURI(urlPrefix + url + '?' + Random.id());                                                   // 148
                                                                                                                // 149
    // Try to download the file a few times.                                                                    // 150
    var tries = 0;                                                                                              // 151
    var tryDownload = function () {                                                                             // 152
      ft.download(uri, versionPrefix + encodeURI(url), function (entry) {                                       // 153
        if (entry) {                                                                                            // 154
          console.log(DEBUG_TAG + "done downloading " + url);                                                   // 155
          // start downloading next queued url                                                                  // 156
          if (queue.length)                                                                                     // 157
            downloadUrl(queue.shift());                                                                         // 158
          afterAllFilesDownloaded();                                                                            // 159
        }                                                                                                       // 160
      }, function (err) {                                                                                       // 161
        // It failed, try again if we have tried less than 5 times.                                             // 162
        if (tries++ < MAX_RETRY_COUNT) {                                                                        // 163
          log("Download error, will retry (#" + tries + "): " + uri);                                           // 164
          tryDownload();                                                                                        // 165
        } else {                                                                                                // 166
          log('Download failed: ' + JSON.stringify(err) + ", source=" + err.source + ", target=" + err.target);
        }                                                                                                       // 168
      });                                                                                                       // 169
    };                                                                                                          // 170
                                                                                                                // 171
    tryDownload();                                                                                              // 172
  };                                                                                                            // 173
                                                                                                                // 174
  _.times(Math.min(MAX_NUM_CONCURRENT_DOWNLOADS, queue.length), function () {                                   // 175
    var nextUrl = queue.shift();                                                                                // 176
    // XXX defer the next download so iOS doesn't rate limit us on concurrent                                   // 177
    // downloads                                                                                                // 178
    Meteor.setTimeout(downloadUrl.bind(null, nextUrl), 50);                                                     // 179
  });                                                                                                           // 180
};                                                                                                              // 181
                                                                                                                // 182
var retry = new Retry({                                                                                         // 183
  minCount: 0, // don't do any immediate retries                                                                // 184
  baseTimeout: 30*1000 // start with 30s                                                                        // 185
});                                                                                                             // 186
var failures = 0;                                                                                               // 187
                                                                                                                // 188
Autoupdate._retrySubscription = function () {                                                                   // 189
  var appId = __meteor_runtime_config__.appId;                                                                  // 190
  Meteor.subscribe("meteor_autoupdate_clientVersions", appId, {                                                 // 191
    onError: function (err) {                                                                                   // 192
      Meteor._debug("autoupdate subscription failed:", err);                                                    // 193
      failures++;                                                                                               // 194
      retry.retryLater(failures, function () {                                                                  // 195
        // Just retry making the subscription, don't reload the whole                                           // 196
        // page. While reloading would catch more cases (for example,                                           // 197
        // the server went back a version and is now doing old-style hot                                        // 198
        // code push), it would also be more prone to reload loops,                                             // 199
        // which look really bad to the user. Just retrying the                                                 // 200
        // subscription over DDP means it is at least possible to fix by                                        // 201
        // updating the server.                                                                                 // 202
        Autoupdate._retrySubscription();                                                                        // 203
      });                                                                                                       // 204
    }                                                                                                           // 205
  });                                                                                                           // 206
  if (Package.reload) {                                                                                         // 207
    var checkNewVersionDocument = function (doc) {                                                              // 208
      var self = this;                                                                                          // 209
      if (doc.version !== autoupdateVersionCordova) {                                                           // 210
        onNewVersion();                                                                                         // 211
      }                                                                                                         // 212
    };                                                                                                          // 213
                                                                                                                // 214
    var handle = ClientVersions.find({                                                                          // 215
      _id: 'version-cordova'                                                                                    // 216
    }).observe({                                                                                                // 217
      added: checkNewVersionDocument,                                                                           // 218
      changed: checkNewVersionDocument                                                                          // 219
    });                                                                                                         // 220
  }                                                                                                             // 221
};                                                                                                              // 222
                                                                                                                // 223
Meteor.startup(function () {                                                                                    // 224
  clearAutoupdateCache(autoupdateVersionCordova);                                                               // 225
});                                                                                                             // 226
Meteor.startup(Autoupdate._retrySubscription);                                                                  // 227
                                                                                                                // 228
                                                                                                                // 229
// A helper that removes old directories left from previous autoupdates                                         // 230
var clearAutoupdateCache = function (currentVersion) {                                                          // 231
  ensureLocalPathPrefix(function () {                                                                           // 232
    // Try to clean up our cache directory, make sure to scan the directory                                     // 233
    // *before* loading the actual app. This ordering will prevent race                                         // 234
    // conditions when the app code tries to download a new version before                                      // 235
    // the old-cache removal has scanned the cache folder.                                                      // 236
    listDirectory(localPathPrefix, {dirsOnly: true}, function (err, names) {                                    // 237
      // Couldn't get the list of dirs or risking to get into a race with an                                    // 238
      // on-going update to disk.                                                                               // 239
      if (err || updating) {                                                                                    // 240
        return;                                                                                                 // 241
      }                                                                                                         // 242
                                                                                                                // 243
      _.each(names, function (name) {                                                                           // 244
        // Skip the folder with the latest version                                                              // 245
        if (name === currentVersion)                                                                            // 246
          return;                                                                                               // 247
                                                                                                                // 248
        // remove everything else, as we don't want to keep too much cache                                      // 249
        // around on disk                                                                                       // 250
        removeDirectory(localPathPrefix + name + '/', function (err) {                                          // 251
          if (err) {                                                                                            // 252
            log('Failed to remove an old cache folder '                                                         // 253
                + name + ':' + err.message);                                                                    // 254
          } else {                                                                                              // 255
            log('Successfully removed an old cache folder ' + name);                                            // 256
          }                                                                                                     // 257
        });                                                                                                     // 258
      });                                                                                                       // 259
    });                                                                                                         // 260
  })                                                                                                            // 261
};                                                                                                              // 262
                                                                                                                // 263
// Cordova File plugin helpers                                                                                  // 264
var listDirectory = function (url, options, cb) {                                                               // 265
  if (typeof options === 'function')                                                                            // 266
    cb = options, options = {};                                                                                 // 267
                                                                                                                // 268
  var fail = function (err) { cb(err); };                                                                       // 269
  window.resolveLocalFileSystemURL(url, function (entry) {                                                      // 270
    var reader = entry.createReader();                                                                          // 271
    reader.readEntries(function (entries) {                                                                     // 272
      var names = [];                                                                                           // 273
      _.each(entries, function (entry) {                                                                        // 274
        if (! options.dirsOnly || entry.isDirectory)                                                            // 275
          names.push(entry.name);                                                                               // 276
      });                                                                                                       // 277
      cb(null, names);                                                                                          // 278
    }, fail);                                                                                                   // 279
  }, fail);                                                                                                     // 280
};                                                                                                              // 281
                                                                                                                // 282
var removeDirectory = function (url, cb) {                                                                      // 283
  var fail = function (err) {                                                                                   // 284
    cb(err);                                                                                                    // 285
  };                                                                                                            // 286
  window.resolveLocalFileSystemURL(url, function (entry) {                                                      // 287
    entry.removeRecursively(function () { cb(); }, fail);                                                       // 288
  }, fail);                                                                                                     // 289
};                                                                                                              // 290
                                                                                                                // 291
var uriToPath = function (uri) {                                                                                // 292
  return decodeURI(uri).replace(/^file:\/\//g, '');                                                             // 293
};                                                                                                              // 294
                                                                                                                // 295
var ensureLocalPathPrefix = function (cb) {                                                                     // 296
  if (! localPathPrefix) {                                                                                      // 297
    if (! cordova.file.dataDirectory) {                                                                         // 298
      // Since ensureLocalPathPrefix function is always called on                                               // 299
      // Meteor.startup, all Cordova plugins should be ready.                                                   // 300
      // XXX Experiments have shown that it is not always the case, even when                                   // 301
      // the cordova.file symbol is attached, properties like dataDirectory                                     // 302
      // still can be null. Poll until we are sure the property is attached.                                    // 303
      console.log(DEBUG_TAG + 'cordova.file.dataDirectory is null, retrying in 20ms');                          // 304
      Meteor.setTimeout(_.bind(ensureLocalPathPrefix, null, cb), 20);                                           // 305
    } else {                                                                                                    // 306
      localPathPrefix = cordova.file.dataDirectory + 'meteor/';                                                 // 307
      cb();                                                                                                     // 308
    }                                                                                                           // 309
  } else {                                                                                                      // 310
    cb();                                                                                                       // 311
  }                                                                                                             // 312
};                                                                                                              // 313
                                                                                                                // 314
                                                                                                                // 315
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.autoupdate = {
  Autoupdate: Autoupdate
};

})();
