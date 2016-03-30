Our implementation of protocol buffer modifies how meteor sends messages across
the socket.

We first include three new files, bytebuffer.js, protobuf.js and json_proto.js
(in sequence of dependency). Ultimately, we use two methods from json_proto:
protoify and parse, which converts between Javascript objects and protocol buffer
strings.

In utils.js, we use parse in DDPCommon.parseDDP and protoify in DDPCommon.stringifyDDP
An DDP instance could receive a protocol string message from the socket, parse it,
and pass the Javascript object to higher level libraries. Similarly, when a DDP instance
sends a message, it will first convert the Javascript object into a protocol buffer
string, and send the compressed string message over the socket.

In this way, we make sure that the higher level libraries remain unchanged, while
the messages sent over the sockets are much smaller with protocol buffer.
