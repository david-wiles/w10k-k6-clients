import {check} from 'k6';
import ws from 'k6/ws';

export const options = {
  stages: [
    {duration: '5m', target: 10000}, // simulate ramp-up of traffic from 1 to 10k users over 5 minutes.
    {duration: '10m', target: 10000}, // stay at 10k users for 10 minutes
    {duration: '5m', target: 0}, // ramp-down to 0 users
  ],
  thresholds: {
    'checks{ws:status}': [{threshold: 'rate > 0.99', abortOnFail: true}],
    'checks{ws:messages}': [{threshold: 'rate > 0.99', abortOnFail: true}]
  }
};

export default function () {
  const url = `ws://127.0.0.1:${__ENV.K6_PORT}/ws`;
  let messageCount = 0;

  const resp = ws.connect(url, null, function (socket) {
    socket.on('open', function () {
      if (__ENV.K6_LOGGING) console.log('connected');

      // Send the current time
      socket.send(Date.now());
      socket.setInterval(function timeout() {
        socket.send(Date.now());
      }, parseInt(__ENV.K6_CLIENT_INTERVAL));

      // Close socket after 1 minute after opening
      socket.setTimeout(function () {
        if (__ENV.K6_LOGGING) console.log('60 seconds passed, closing the socket');
        socket.close();
      }, 60000);
    })

    socket.on('message', function (message) {
      if (__ENV.K6_LOGGING) console.log(`Received message: ${message}`);
      messageCount++;
    });

    socket.on('close', function () {
      if (__ENV.K6_LOGGING) console.log('disconnected');
    });

    socket.on('error', function (e) {
      if (e.error() != 'websocket: close sent') {
        console.error('An unexpected error occured: ', JSON.stringify(e));
      }
    });
  });

  const pct10 = parseInt(__ENV.K6_EXPECTED_MSG) * 0.1;

  check(resp, {'status is 101': (r) => r && r.status === 101}, {ws: 'status'});
  check(resp, {'message count is accurate': Math.abs(messageCount - parseInt(__ENV.K6_EXPECTED_MSG)) <= pct10}, {ws: 'messages'});
}
