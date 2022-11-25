const redis = require('./detail.js').redis;
const md5 = require('js-md5');

module.exports.post = async (data, res) => {
  id = md5(data);
  await redis.SETEX(id, 300, data);
  res.send(id);
}

module.exports.get = async (id, res) => {
  data = await redis.get(id);
  res.json(JSON.parse(data));
}
