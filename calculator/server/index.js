import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { avg, max, sqrt, sum } from "./service.js";

const packageDef = protoLoader.loadSync("../proto/calculator.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);

const calculator = grpcObject.calculator;

const server = new grpc.Server();

server.addService(calculator.calculator.service, 
    {
        "Sum": sum,
        "Avg": avg,
        "Max": max,
        "Sqrt": sqrt
    });

server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error("Failed to bind server:", err);
        return;
    }
    console.log(`Server running at http://0.0.0.0:${port}`);
});