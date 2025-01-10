import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("todo.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);

const todoPackage = grpcObject.todoPackage;

const server = new grpc.Server();

const todos = [];

server.addService(todoPackage.Todo.service, 
    {
        "createTodo": createTodo,
        "readTodosStream": readTodosStream
    });

function createTodo (call, callback) {
    const todoItem = {
        "id": todos.length + 1,
        "text": call.request.text
    }
    todos.push(todoItem)
    callback(null, todoItem);
}

function readTodosStream (call, callback) {
    todos.forEach(t => call.write(t));
    call.end();
}

server.bindAsync("0.0.0.0:4000", grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error("Failed to bind server:", err);
        return;
    }
    console.log(`Server running at http://0.0.0.0:${port}`);
});