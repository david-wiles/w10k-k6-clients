# k6-clients

These JavaScript files are meant to be used with [k6](https://k6.io/docs/) to test whether a server is able to handle 
10k concurrent websocket connections. The checks ensure that the websocket was opened successfully and that at least 90%
of messages were received within the websocket's lifetime.

Start the scripts with 

```
k6 run <script>
```

The tests will exit early if either check falls below a 99% success rate.
