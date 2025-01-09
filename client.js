import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("todo.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);

const todoPackage = grpcObject.todoPackage;

const text = process.argv[2];

const client = new todoPackage.Todo(
    "localhost:4000",
    grpc.credentials.createInsecure()
);

client.createTodo(
    {
        id: -1,
        text,
    },
    (err, response) => {
        if (err) {
            console.error("Error from server:", err.message);
            return;
        }
        console.log("Received from server:", JSON.stringify(response));
    }
);

const call = client.readTodosStream();
call.on("data", item => {
    console.log("received item from server " + JSON.stringify(item))
})

call.on("end", e => console.log("server done!"))
