'use strict';

const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = 'N*VDfCn/NY}8E"z:y273a;x7e4bSqlPY';
const iv = '$G}rc#n7n3Rv)@t%';

decrypt = (text) => {
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

module.exports = decrypt;