const REGEX = /https?:\/\/(www\.)?[\wА-Яа-я-]+\.[\wА-Яа-я-]{2,8}(\/?[\w\-._~:/?#[\]@!$&'()*+,;=]*)*/;
const DEV_SECRET = 'super-strong-secret';

module.exports = { REGEX, DEV_SECRET };
