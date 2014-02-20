var child_process = require('child_process');

module.exports.get = function (path, callback) {
  var command = 'chef-shell';
  var args = [ '-z', '-l', 'fatal' ];
  var proc = child_process.spawn(command, args);
  var result = '';
  proc.stdout.on('data', function (chunk) {
    if (/^chef >/m.test(String(chunk))) {
      proc.stdin.write('node.' + path + '\n');
      return;
    }

    var lines = String(chunk).split('\n').filter(function (line) {
      return (line.substr(0, 4) === ' => ');
    }).map(function (line) {
      return line.substr(4);
    });
    if (lines.length > 0) {
      result = lines.join('\n') + '\n';
      proc.kill('SIGHUP');
    }
  });
  proc.on('exit', function (code) {
    if (!code) {
      var value = result.trim();
      callback(null, value);
    } else {
      callback(new Error('Failed to get the attribute value'), null);
    }
  });
};
