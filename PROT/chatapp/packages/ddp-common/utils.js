
DDPCommon.SUPPORTED_DDP_VERSIONS = [ '1', 'pre2', 'pre1' ];

/**
 * Parse a protocol string message into Javascript object. This method will check
 * the validity of parameter string. An DDP instance could recieve a stringMessage
 * from the socket and use this method to retrive the message
 *
 * @param stringMessage: the serialized protocol buffer string
 * @returns Javascript object corresponding to the stringMessage
 */
DDPCommon.parseDDP = function (stringMessage) {
  try {
    // Use JSONproto.parse to parse the protocol buffer string
    var msg = JSONproto.parse(stringMessage);
  } catch (e) {
    Meteor._debug("Discarding message with invalid JSON", stringMessage);
    return null;
  }
  // DDP messages must be objects.
  if (msg === null || typeof msg !== 'object') {
    Meteor._debug("Discarding non-object DDP message", stringMessage);
    return null;
  }

  // massage msg to get it into "abstract ddp" rather than "wire ddp" format.

  // switch between "cleared" rep of unsetting fields and "undefined"
  // rep of same
  if (_.has(msg, 'cleared')) {
    if (!_.has(msg, 'fields'))
      msg.fields = {};
    _.each(msg.cleared, function (clearKey) {
      msg.fields[clearKey] = undefined;
    });
    delete msg.cleared;
  }

  _.each(['fields', 'params', 'result'], function (field) {
    if (_.has(msg, field))
      msg[field] = EJSON._adjustTypesFromJSONValue(msg[field]);
  });

  return msg;
};

/**
 * Serialize a Javascript object into a protocol buffer string. When an DDP instance
 * sends a message, it will use this method to convert the Javascript object into
 * protocol buffer string before sending the message over the socket.
 *
 * @param msg: a Javascript message object that needs to be serialized
 * @returns the serialized protocol buffer string of the Javascript object
 */
DDPCommon.stringifyDDP = function (msg) {
  var copy = EJSON.clone(msg);
  // swizzle 'changed' messages from 'fields undefined' rep to 'fields
  // and cleared' rep
  if (_.has(msg, 'fields')) {
    var cleared = [];
    _.each(msg.fields, function (value, key) {
      if (value === undefined) {
        cleared.push(key);
        delete copy.fields[key];
      }
    });
    if (!_.isEmpty(cleared))
      copy.cleared = cleared;
    if (_.isEmpty(copy.fields))
      delete copy.fields;
  }
  // adjust types to basic
  _.each(['fields', 'params', 'result'], function (field) {
    if (_.has(copy, field))
      copy[field] = EJSON._adjustTypesToJSONValue(copy[field]);
  });
  if (msg.id && typeof msg.id !== 'string') {
    throw new Error("Message id is not a string");
  }

  // Use JSONproto.protoify to serialze the object
  return JSONproto.protoify(copy);
};
