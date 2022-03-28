import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  stages: [
      { duration: '1m', target: 200 }, // below normal load
      { duration: '2m', target: 200 },
      { duration: '1m', target: 300 }, // normal load
      { duration: '2m', target: 300 },
      { duration: '1m', target: 400 }, // around the breaking point
      { duration: '2m', target: 400 },
      { duration: '1m', target: 500 }, // beyond the breaking point
      { duration: '2m', target: 500 },
      { duration: '3m', target: 0 }, // scale down. Recovery stage.
  ],
  thresholds: {
          http_req_duration: ['p(99)<500'],
      },
};

export default function () {
  const before = new Date().getTime();
      const T = 0.5;

      const url = 'https://madini.kro.kr/login/token';
      const data = JSON.stringify({
          email: 'himj131@gmail.com',
          password: '1234'
      });
      const headers = {
          headers: {
              'Content-Type': 'application/json',
          },
      };
      const loginResponse = http.post(url, data, headers);
      check(loginResponse, {
          'logged in successfully': (response) => response.json('accessToken') !== '',
      });

      const after = new Date().getTime();
      const diff = (after - before) / 1000;
      const remainder = T - diff;
      if (remainder > 0) {
        sleep(remainder);
      }
}