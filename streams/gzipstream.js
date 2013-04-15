var Transform = require('stream').Transform,
  util = require('util'),
  spawn = require('child_process').spawn;

var GZipStream = function() {
  var self = this;

  Transform.apply(this, arguments);

  var gzipper = this._gzipper = spawn('gzip');

  // read data out of the gzipper and push it out
  var readGZip = function() {
    var data;
    while( (data = gzipper.stdout.read()) !== null) {
      self.push(data);
    }
  };
  gzipper.stdout.on('readable', readGZip);

  // emit end at some point
  gzipper.on('close', this.emit.bind(this, 'close'));
};

// this is a custom stream object
util.inherits(GZipStream, Transform);

// implement write, process some data
GZipStream.prototype._transform = function(data, encoding, callback) {
  if(this._gzipper.stdin.writable) {
    this._gzipper.stdin.write(data, encoding, callback);
  } else {
    return callback(new Error('Unable to gzip. Stream not writable'));
  }
};

GZipStream.prototype._flush = function(callback) {
  this._gzipper.stdin.end(callback);
  this._gzipper = null;
};

module.exports = GZipStream;
