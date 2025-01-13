import { Server, loadPackageDefinition, ServerCredentials } from '@grpc/grpc-js';
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("../protos/processing.proto", {});
const grpcObject = loadPackageDefinition(packageDef);

const processing = grpcObject.processing;

function process(call, _) {
    let onboardRequest = call.request;
    let time = onboardRequest.orderId * 1000 + onboardRequest.degreeId * 10;
    call.write({ status: 0 });
    call.write({ status: 1 });
    setTimeout(() => {
        call.write({ status: 2 });
        setTimeout(() => {
            call.write({ status: 3 });
            call.end();
        }, time);
    }, time);
}

const server = new Server();
server.addService(processing.Processing.service, {process});
server.bindAsync("0.0.0.0:50052", ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error("Failed to bind server:", err);
        return;
    }
    console.log(`Server running at http://0.0.0.0:${port}`);
});