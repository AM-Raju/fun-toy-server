const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// Mongodb code

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2jzgz56.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db("toyDB").collection("robotToys");

    // Indexing to do search on all jobs pages.
    /*   const indexKeys = { title: 1 };
    const indexOptions = { name: "title" };

    const result = await toyCollection.createIndex(indexKeys, indexOptions); */
    //End of indexing block

    // Getting all toy data from server
    app.get("/all-toys", async (req, res) => {
      const limit = 20;
      const result = await toyCollection.find().limit(limit).toArray();
      res.send(result);
    });

    // Getting all toy data from server and filter category wise
    // for shop by category
    app.get("/toys/:text", async (req, res) => {
      const text = req.params.text;
      if (text == "dogRobot" || text == "transformersRobot" || text == "babysRobot") {
        const result = await toyCollection.find({ category: text }).toArray();
        return res.json(result);
      } else {
        const result = await toyCollection.find().limit(12).toArray();
        return res.json(result);
      }
    });

    // For search function fo all toy pages.
    app.get("/all-toys/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollection
        .find({
          $or: [{ title: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      res.json(result);
    });

    app.get("/my-toys/:email", async (req, res) => {
      const emailId = req.params.email;
      const result = await toyCollection.find({ email: emailId }).sort({ price: -1 }).toArray();
      res.json(result);
    });

    // for view details button
    app.get("/toyDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      /*     const options = {
        projection: { title: 1, price: 1, rating: 1, description: 1 },
      }; */
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.post("/all-toys", async (req, res) => {
      const toy = req.body;
      toy.createdAt = new Date();
      const result = await toyCollection.insertOne(toy);
      res.json(result);
    });

    app.delete("/all-toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    /*     await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!"); */
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("fun toy is running");
});

app.listen(port, () => {
  console.log(`fun toy is running on port: ${port}`);
});
