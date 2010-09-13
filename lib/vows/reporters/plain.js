var sys = require('sys');

var options = {};
var puts = function(str) {
    options.stream.write(str + '\n');
};

var report_functions = {
    'subject' : report_subject,
    'context' : report_context,
    'vow' : report_vow,
    'end' : report_end,
    'finish' : report_finish,
    'error' : report_error
};

//
// Plain reporter
//

this.name = 'plain';
this.report = function (data, s) {
    var event = data[1];

    options.stream = typeof(s) === 'object' ? s : process.stdout;

    report_functions[data[0]](event);
};

this.print = function (str) {
    sys.print(str);
};

function report_subject(event) {
    puts('\n>>>>' + event + '<<<<\n');
};

function report_context(event) {
    puts('  ' + event);
};

function report_vow(event) {
    var buffer = [];

    buffer.push('   ' + {
        honored: '+ ',
        broken:  '- ',
        errored: '- ',
        pending: ' > '
    }[event.status] + event.title);

    if (event.status === 'broken') {
        buffer.push('      >> ' + event.exception);
    }
    else if (event.status === 'errored') {
        if (event.exception.type === 'promise') {
            buffer.push('      >> ' + "An unexpected error was caught: " +
                           event.exception.error);
        }
        else {
            buffer.push('      >> Error - ' + event.exception);
        }
    }
    puts(buffer.join('\n'));
};

function report_end(event) {
    puts();
};

function report_finish(event) {
    var result = [];
    var time = '';
    var header;
    var complete = event.honored + event.pending + event.errored + event.broken;
    var status = (event.errored && 'errored') || (event.broken && 'broken') ||
                 (event.honored && 'honored') || (event.pending && 'pending');

    event.honored && result.push(event.honored + ' honored');
    event.broken  && result.push(event.broken  + ' broken');
    event.errored && result.push(event.errored + ' errored');
    event.pending && result.push(event.pending + ' pending');

    if (complete < event.total) {
        result.push((event.total - complete) + " dropped");
    }

    result = result.join('  ');

    header = {
        honored: '+ ' + 'OK',
        broken:  '- ' + 'Broken',
        errored: '- ' + 'Errored',
        pending: '> ' + 'Pending'
    }[status] + ' >> ';

    if (typeof event.time === 'number') {
        time = ' (' + event.time.toFixed(3) + 's)';
    }

    puts(header + result + time);
};

function report_error(event) {
    puts('- Errored >> ' + event.suite.subject + ': ' + event.context + ' > ' + event.error);
};
