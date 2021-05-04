const moment = require('moment');

function formatMessage(username, text, isAdmin)
{
    return {
        username: username,
        text: text,
        time: moment().format('h:mm a'),
        isAdmin: isAdmin
    }
}

module.exports = formatMessage;