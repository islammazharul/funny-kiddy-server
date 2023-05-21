const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 6500;
const app = express();

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.h8hwzy8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const toysCollection = client.db("toysCarDB").collection("products");


        app.get("/allProducts", async (req, res) => {
            const result = await toysCollection.find().limit(20).toArray();
            // console.log(result);
            res.send(result)
        })

        app.get("/allProducts/:text", async (req, res) => {
            if (req.params.text == "Sports-Car" || req.params.text == "Regular-Car" || req.params.text == "Police-Car") {
                const result = await toysCollection.find({
                    sub_category: req.params.text
                }).toArray()
                res.send(result)
            }
        })

        app.get("/singleProduct/:id", async (req, res) => {
            const product = await toysCollection.findOne({
                _id: new ObjectId(req.params.id)
            })
            res.send(product)
        })

        app.get("/myProducts/:email", async (req, res) => {
            const products = await toysCollection.find({
                postedBy: req.params.email
            }).toArray();
            res.send(products)
        })

        app.get("/getProductsByName/:text", async (req, res) => {
            const searchText = req.params?.text
            const result = await toysCollection.find({
                toys_name: { $regex: searchText, $options: "i" }
            }).toArray();
            console.log(result);
            res.send(result)


        })


        app.post("/post-products", async (req, res) => {
            const body = req.body;
            // console.log(body);
            const result = await toysCollection.insertOne({
                ...body,
                Price: parseFloat(body.Price),
            });
            res.send(result);
        });

        app.get("/ascending", async (req, res) => {
            const email = req.query.email;
            const filter = { postedBy: email };
            const result = await toysCollection
                .find(filter)
                .sort({ Price: 1 })
                .toArray();
            res.send(result);
        });
        app.get("/descending", async (req, res) => {
            const email = req.query.email;
            const filter = { postedBy: email };
            const result = await toysCollection
                .find(filter)
                .sort({ Price: -1 })
                .toArray();
            res.send(result);
        });

        app.put("/updateProduct/:id", async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            // console.log(body);
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    Price: body.Price,
                    quantity: body.quantity,
                    Description: body.Description
                }
            }
            const result = await toysCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.delete("/deleteProduct/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const filter = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(filter);
            // console.log(result);
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("Funny kiddy is running")
})
app.listen(port, () => {
    console.log(`Funny kiddy is running on port: ${port}`);
})