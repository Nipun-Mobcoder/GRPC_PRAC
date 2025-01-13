import { Server, ServerCredentials, loadPackageDefinition } from '@grpc/grpc-js';
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("../protos/degree.proto", {});
const grpcObject = loadPackageDefinition(packageDef);

const degree = grpcObject.degree;

const DEGREE = [
    {
        id: 100,
        degreeId: 1000,
        title: 'Engineering',
        major: 'Electronics'
    },
    {
        id: 200,
        degreeId: 2000,
        title: 'Engineering',
        major: 'Computer Science'
    },
    {
        id: 300,
        degreeId: 3000,
        title: 'Engineering',
        major: 'Telecommunication'
    },
    {
        id: 400,
        degreeId: 4000,
        title: 'Commerce',
        major: 'Accounts'
    }
];

function findDegree(call, callback) {
    let degree = DEGREE.find((degree) => degree.degreeId == call.request.id);
    if(degree) {
        callback(null, degree);
    }
    else {
        callback({
            message: 'Degree not found',
            code: 3
        });
    }
}

const server = new Server();
server.addService(degree.Degrees.service, { "find": findDegree });
server.bindAsync("0.0.0.0:50051", ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error("Failed to bind server:", err);
        return;
    }
    console.log(`Server running at http://0.0.0.0:${port}`);
});