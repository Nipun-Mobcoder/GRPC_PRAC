import { status } from '@grpc/grpc-js';
import { DATA, END } from '../constants/constants.js';

export function sum(call, callback) {
  const res = {
    "result": call.request.firstNumber + call.request.secondNumber,
  }

  callback(null, res);
}

export function avg(call, callback) {
  let count = 0.0;
  let total = 0.0;

  call.on(DATA, (req) => {
    total += req.number;
    ++count;
  });

  call.on(END, () => {
    const res = {"result": (total / count)};

    callback(null, res);
  });
}

export function max(call, _) {
  let max = 0;

  call.on(DATA, (req) => {
    const number = req.number;

    if (number > max) {
      const res = {"result": number};
      call.write(res);
      max = number;
    }
  });

  call.on(END, () => call.end());
}

export function sqrt(call, callback) {
  const number = call.request.number;

  if (number < 0) {
    callback({
      code: status.INVALID_ARGUMENT,
      message: `Number cannot be negative, received: ${number}`,
    });
  }

  const res = {"result": Math.sqrt(number)};

  callback(null, res);
}