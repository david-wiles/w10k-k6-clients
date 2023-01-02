# Broadcast tests

These tests are intended to be used with the broadcast mode of the w10k servers. This means that at a set interval,
**every** connection will receive the current time.

These scripts use the following environment variables, in addition to the ones defined in the top-level readme:

* `K6_CLIENT_INTERVAL=<int>` the interval in milliseconds to send a message to the server
* `K6_EXPECTED_MSG=<int>` the number of messages we expect from the server over 1 minute
