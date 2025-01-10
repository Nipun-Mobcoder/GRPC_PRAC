import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { DATA, END } from '../constants/constants.js';

const packageDef = protoLoader.loadSync("../proto/calculator.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);

const calculator = grpcObject.calculator;

function doSum(client) {
  const req = {
    firstNumber: 12,
    secondNumber: 25
  };

  client.sum(req, (err, res) => {
    if (err) {
      return console.log(err);
    }

    console.log(`Sum: ${res.result}`);
  });
}

function doAvg(client) {
  const numbers = [...Array(11).keys()].slice(1);
  const call = client.avg((err, res) => {
    if (err) {
      return console.error(err);
    }

    console.log(`Avg: ${res.result}`);
  });

  numbers.map((number) => {
    return { number };
  }).forEach((req) => call.write(req));

  call.end();
}

function doMax(client) {
  const numbers = [4, 7, 2, 19, 4, 6, 32];
  const call = client.max();

  call.on(DATA, (res) => {
    console.log(`Max: ${res.result}`);
  });

  numbers.map((number) => {
    return {"number": number};
  }).forEach((req) => call.write(req));

  call.end();
}

function doSqrt(client, number) {
  const req = { "number": number }
  client.sqrt(req, (err, res) => {
    if (err) {
      console.log(err);
      return; 
    }

    console.log(`Sqrt: ${res.result}`);
    client.close();
  });
}

function main() {
  const client = new calculator.calculator(
      '0.0.0.0:50051',
      grpc.credentials.createInsecure()
  );

  doMax(client);
}

main();