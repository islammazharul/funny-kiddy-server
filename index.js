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
        await client.connect();

        const toysCollection = client.db("toysCarDB").collection("products");

        app.get("/allProducts", async (req, res) => {
            let query = req.query;
            console.log(query);

            if (req.query?.email) {
                query = { postedBy: req.query.email }
            }

            if (req.query?.name) {
                query = { toys_name: req.query.name }
            }

            if (req.query?.subcategory) {
                query = { sub_category: req.query.subCategory }
            }
            const sort = req.query.sort == "Ascending";
            console.log(sort);
            const result = await toysCollection.find(query).limit(20).sort({ Price: sort ? 1 : -1 }).toArray();
            // console.log(result);
            res.send(result)
        })

        app.get("/singleProduct/:id", async (req, res) => {
            // console.log(req.params.id);
            const product = await toysCollection.findOne({
                _id: new ObjectId(req.params.id)
            })
            res.send(product)
        })

        app.get("/myProducts/:email", async (req, res) => {
            // console.log(req.params.email);
            const products = await toysCollection.find({
                postedBy: req.params.email
            }).toArray();
            res.send(products)
        })

        app.get("/getProductsByName/:name", async (req, res) => {
            const result = await toysCollection.find({
                toys_name: req.params.name
            }).toArray();
            res.send(result)
        })

        app.post("/post-products", async (req, res) => {
            const body = req.body;
            body.createdAt = new Date();
            // console.log(body);
            const result = await toysCollection.insertOne(body);
            if (result?.insertedId) {
                return res.status(200).send(result)
            }
            else {
                return res.status(404).send({
                    message: "insert failed try again later",
                    status: false
                })
            }
        })

        app.put("/updateProduct/:id", async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            console.log(body);
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