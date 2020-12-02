'use strict';

const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = 'N*VDfCn/NY}8E"z:y273a;x7e4bSqlPY';
const iv = '$G}rc#n7n3Rv)@t%';

encrypt = (text) => {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

module.exports = encrypt;
