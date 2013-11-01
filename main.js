var fs = require('fs'),
    csv = require('csv'),
    _ = require('lodash');

var argv = require('optimist')
    .usage('Usage: $0 -csv [path/to/csv] -out [path/to/output.json]')
    .demand(['csv','out'])
    .argv,
    list = [],
    keys;

// stream csv file
csv()
    .from.stream(fs.createReadStream(argv.csv), { delimiter: '\t' })
        .on('record', parseRow)
        .on('end', function (count) {
            console.log('Number of lines: ' + count);
            writeJson();
        })
        .on('error', function (error) {
            console.log(error.message);
        });

// parse csv row
function parseRow(row, index) {
    var json;

    if(index === 0) {
        keys = row;
        _.each(keys, function (key, index) {
            var words = key.split('_');
            keys[index] = words[0].toLowerCase() + _.reduce(_.rest(words, 1), function (memo, word) {
                word = word.toLowerCase();
                word = word.charAt(0).toUpperCase() + word.substr(1, word.length);
                return memo + word;
            }, '');
        });
    }
    else {
        json = _.zipObject(keys, row);

        list.push(json);
    }
}

function writeJson() {
    fs.writeFile(argv.out, JSON.stringify(list, null, 4), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('File written to ', argv.out);
    });
}