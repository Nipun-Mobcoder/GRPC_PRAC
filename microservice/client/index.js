import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import protoLoader from "@grpc/proto-loader";
import express from "express"

const packageDefDegree = protoLoader.loadSync("./protos/degree.proto", {});
const grpcObjectDegree = loadPackageDefinition(packageDefDegree);

const packageDefProcessing = protoLoader.loadSync("./protos/processing.proto", {});
const grpcObjectProcessing = loadPackageDefinition(packageDefProcessing);

const processing = grpcObjectProcessing.processing;

const degree = grpcObjectDegree.degree;


const degreeStub = new degree.Degrees('0.0.0.0:50051',
                        credentials.createInsecure());
const processingStub = new processing.Processing('0.0.0.0:50052',
                        credentials.createInsecure());

const app = express();
app.use(express.json());
                        
const port = 3000;
let orders = {};

function processAsync(order) {
    degreeStub.find({ id: order.degreeId }, (err, degree) => {
        if(err) return;

        orders[order.id].degree = degree;
        const call = processingStub.process({
            orderId: order.id,
            degreeId: degree.id
        });
        call.on('data', (statusUpdate) => {
            let statusValue;
            switch (statusUpdate.status) {
                case 0:
                    statusValue = "NEW"
                    break;
                case 1:
                    statusValue = "QUEUED"
                    break;
                case 2:
                    statusValue = "PROCESSING"
                    break;
                case 3:
                    statusValue = "DONE"
                    break;
                default:
                    statusValue = "ERROR"
                    break;
            }
            orders[order.id].status = statusValue;
        });
    });
}

app.post('/studentOnboard', (req, res) => {
    if(!req.body.degreeId) {
        res.status(400).send('Product identifier is not set');
        return;
    }
    let orderId = Object.keys(orders).length + 1;
    let order = {
        id: orderId,
        status: "NEW",
        degreeId: req.body.degreeId,
        personalDetails: {
            name: req.body.name,
            DOB : req.body.DOB,
            education : req.body.education,
            fatherName : req.body.father
        },
        createdAt : new Date().toLocaleString()
    };
    orders[order.id] = order;
    processAsync(order);
    res.send(order);
});

app.get('/onboardingStatus/:id', (req, res) => {
    if(!req.params.id || !orders[req.params.id]) {
        res.status(400).send('OnBoarding form  not found');
        return;
    }
    res.send(orders[req.params.id]);
});

app.listen(port, () => {
  console.log(`API is listening on port ${port}`)
});