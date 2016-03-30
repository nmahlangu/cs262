Package.describe({
  summary: "Code shared beween ddp-client and ddp-server",
  version: '1.2.2',
  documentation: null
});

Package.onUse(function (api) {
  api.use(['check', 'random', 'ejson', 'underscore', 'tracker',
           'retry'],
          ['client', 'server']);

  /**
   * namespace.js defines namespace for DDPCommon-related methods/classes
   */
  api.addFiles('namespace.js');

  /**
   * Bytebuffer implements Bytebuffer in Javascript.
   * This library is a dependency for the Protobuf library.
   */
  api.addFiles('bytebuffer.js',['client', 'server']);

  /**
   * Protobuf implements Google's Protocol buffer in Javascript.
   * This library is a dependency for the json_proto library.
   *
   * Specifcally, this library handles serialzing a Protocol Buffer object, with
   * help of Bytebuffer.
   */
  api.addFiles('protobuf.js',['client', 'server']);

  /**
   * json_proto handles conversion between a JSON object and a protocol buffer string.
   * Specifcally, we use two methods from this library: protoify and parse
   *
   * For protofiy, the library will first convert an JSON object into a Protocol
   * Buffer object, and then serialize it using the Protobuf library.
   *
   * For parse, it will first parse a protocol buffer string into a Protocol Buffer
   * object, and then convert it into JSON.
   *
   * We use the json_proto library in DDP-common's utils.js to covert between
   * DDP messages, which are Javascript objects, and DDP message strings, which
   * are Protocol buffer serializations of message objects
   */
  api.addFiles('json_proto.js',['client', 'server']);

  /**
   * utils.js implements DDPCommon.parseDDP and DDPCommon.stringifyDDP, which are
   * methods used by higher level libraries (including ddp-client and ddp-server)
   * to convert between a Javascript message object and a seralized protocol buffer
   * string.
   */
  api.addFiles('utils.js', ['client', 'server']);

  /**
   * heartbeat, method_invocation and random_stream came with the original implementation
   * of DDPCommon. We did not modify these files.
   */
  api.addFiles('heartbeat.js', ['client', 'server']);
  api.addFiles('method_invocation.js', ['client', 'server']);
  api.addFiles('random_stream.js', ['client', 'server']);

  api.export('DDPCommon');
});
