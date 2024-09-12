const accountSid = 'AC9b5c4e173137346970a2ecf10e1a0c47';
const authToken = '8685dd3ea020c4607595253551a91238';
const client = require('twilio')(accountSid, authToken);
function SMS(number,text) {
    client.messages
        .create({
            body: text,
            from: '+16463928566',
            to: '+91' + number
        });
}

module.exports = SMS