const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
    // await client.connect();

    const apartmentsCollection = client.db("skyviewDb").collection("apartments");
    const reservationCollection = client.db("skyviewDb").collection("reservation");
    const userCollection = client.db("skyviewDb").collection("users");
    const announcementCollection = client.db("skyviewDb").collection("announcements");
    const paymentCollection = client.db("skyviewDb").collection("payments");
    const cuponCollection = client.db("skyviewDb").collection("cupons");

    //middlewares

    const verifyToken = (req, res, next) => {
      console.log("inside verify token", req.headers);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "forbidden access" });
      }

      const token = req.headers.authorization.split(" ")[1];

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "forbidden access" });
        }
        req.decoded = decoded;
        next();
      });
    };

    //user verify admin after verifyToken
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "forbidden access" });
      }
      next(); // don't forget to call next() to pass control to the next middleware function
    };

    //user related api
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/users/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "unauthorized access" });
      }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;

      if (user) {
        admin = user.role === "admin";
      }

      res.send({ admin });
    });
    app.get("/users/member/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "unauthorized access" });
      }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let member = false;

      if (user) {
        member = user.role === "member";
      }

      res.send({ member });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;

      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.post("/cupons", async (req, res) => {
      const cupon = req.body;

      const query = { _id: cupon._id };
      const existingCupon = await cuponCollection.findOne(query);
      if (existingCupon) {
        return res.send({ message: "Cupon already exists", insertedId: null });
      }

      try {
        const result = await cuponCollection.insertOne(cupon);
        res.send({ message: "Cupon created successfully", insertedId: result.insertedId });
      } catch (error) {
        console.error("Error during cupon post", error);
        res.status(500).send({ error: "An error occurred while creating the cupon" });
      }
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/users/admin/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    app.patch("/users/member/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email }; // Filter based on email
      const updatedDoc = {
        $set: {
          role: "member",
        },
      };

      try {
        const result = await userCollection.updateOne(filter, updatedDoc);
        if (result.modifiedCount > 0) {
          res.send({ success: true });
        } else {
          res.status(400).send({ success: false, message: "Failed to update user role." });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Internal server error." });
      }
    });
    app.patch("/users/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email }; // Filter based on email
      const updatedDoc = {
        $set: {
          role: "user",
        },
      };

      try {
        const result = await userCollection.updateOne(filter, updatedDoc);
        if (result.modifiedCount > 0) {
          res.send({ success: true });
        } else {
          res.status(400).send({ success: false, message: "Failed to update user role." });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Internal server error." });
      }
    });
    app.patch("/reservation/status/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email }; // Filter based on email
      const updatedDoc = {
        $set: {
          status: "checked",
        },
      };

      try {
        const result = await reservationCollection.updateOne(filter, updatedDoc);
        if (result.modifiedCount > 0) {
          res.send({ success: true });
        } else {
          res.status(400).send({ success: false, message: "Failed to update user role." });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Internal server error." });
      }
    });

    app.get("/apartments", async (req, res) => {
      const result = await apartmentsCollection.find().toArray();
      res.send(result);
    });

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

    app.get("/reservation", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await reservationCollection.find().toArray();
      res.send(result);
    });

    app.get("/cupons", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cuponCollection.find().toArray();
      res.send(result);
    });

    app.post("/cupons", async (req, res) => {
      try {
        const cupon = req.body;
        const result = await axiosSecure.post("/cupons", cupon);
        res.send(result.data);
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Internal server error." });
      }
    });

    app.get("/reservation/agreement", async (req, res) => {
      try {
        const pendingReservations = await reservationCollection.find({ status: "pending" }).toArray();
        res.send(pendingReservations);
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Internal server error." });
      }
    });

    app.delete("/reservation/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reservationCollection.deleteOne(query);
      res.send(result);
    });

    //jwt related api

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
      res.send({ token });
    });

    //announcement related api
    app.get("/announcement", async (req, res) => {
      const result = await announcementCollection.find().toArray();
      res.send(result);
    });

    app.post("/announcement", async (req, res) => {
      const data = req.body;
      const result = await announcementCollection.insertOne(data);
      res.send(result);
    });

    //payment intent

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const paymentResult = await paymentCollection.insertOne(payment);

      const query = {
        _id: {
          $in: payment.reservationId.map((id) => new ObjectId(id)),
        },
      };

      console.log("payment info", payment);
      res.send(paymentResult);
    });

    app.get("/payments/:email", async (req, res) => {
      const query = { email: req.params.email };
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
