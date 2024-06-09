const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zedvr4o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const apartmentsCollection = client.db('skyviewDb').collection('apartments')
    const reservationCollection = client.db('skyviewDb').collection('reservation')

    app.get('/apartments', async (req, res)=> {
        const result = await apartmentsCollection.find().toArray();
        res.send(result);
    })


    // app.post('/reservation', async (req, res)=> {
    //     const data = req.body;
    //     const result = await reservationCollection.insertOne(data);
    //     res.send(result);
    // })

    app.post("/reservation", async (req, res) => {
        const data = req.body;
        console.log(data);
        const userId = data.email; 
      
        try {
          // Ensure userId is present
          if (!userId) {
            return res.status(400).send({ message: "User ID is required." });
          }
      
          // Check if a reservation already exists for the user
          const existingReservation = await reservationCollection.findOne({ email: userId }); 
      
          if (existingReservation) {
            return res.status(400).send({ message: "User has already applied for a job." });
          }
      
          // Insert new reservation
          const result = await reservationCollection.insertOne(data);
          res.status(201).send(result);
        } catch (error) {
          console.error("Error processing reservation:", error);
          res.status(500).send({ message: "An error occurred. Please try again later." });
        }
      });

    app.get('/reservation', async (req, res)=> {
        const email = req.query.email;
        const query = {email: email};
        const result = await reservationCollection.find().toArray();
        res.send(result);
    })

    app.delete('/reservation/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await reservationCollection.deleteOne(query);
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
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`skyview apartment listening on port ${port}`);
});
