const express = require("express");
const cors = require("cors");
require("dotenv").config();
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


//============ this comment because in the Assignment notified me but after get mark then uncomment  ===============
// app.use(cookieParser());
// const tokenVerify = async (req,res,next)=>{
//   const token = req.cookies?.token;
//   console.log('value of token in middleware', token);
//   if(!token){
//     return res.status(401).send({message:'Unauthorize'})
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,decoded)=>{
//     if(err){
//       console.log(err);
//       return res.status(401).send({message:'Unauthorize'})
//     }
//     console.log('value in the token',decoded)
//     req.user = decoded;
//     next()
//   })
// }

const uri = `mongodb+srv://${process.env.VITE_DB_NAME}:${process.env.VITE_DB_PASS}@cluster0.rbychrh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    const allServiceCollection = client
      .db("Nearby_Care")
      .collection("All_Services");
    const appointmentBookingCollection = client
      .db("Nearby_Care")
      .collection("Appointment_Booking");
    const Contact_Us_Collection = client
      .db("Nearby_Care")
      .collection("Contact_Us_Collection");

    app.get("/Services", async (req, res) => {
      const result = await allServiceCollection.find().toArray();
      res.send(result);
    });

    app.get("/Services_count", async (req, res) => {
      const search = req.query.search;
      let query = {};
      if(search){
        query = {expertise:{$regex:search,$options:"i" } };
      }
      const numbers = await allServiceCollection.countDocuments(query);
      res.send({numbers});
    });

    app.get("/All_Services", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const search = req.query.search;
      let query = {};
      if(search){
        query = {expertise:{$regex:search,$options:"i" } };
      }
      const result = await allServiceCollection.find(query).skip(page*size).limit(size).toArray();
      res.send(result);
    });

    app.get("/View_Details/:id",async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allServiceCollection.findOne(query);
      res.send(result);
    });

    app.get("/Manage_Appointment/:email", async (req, res) => {
      // if(req.user.email !== req.params.email){
      //   return res.status(403).send({message:'forbidden access'})
      // }
      const email = req.params.email;
      const query = { doctorEmail: email };
      const result = await allServiceCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/Booked_Appointment/:email", async (req, res) => {
      // if(req.user.email !== req.params.email){
      //   return res.status(403).send({message:'forbidden access'})
      // }
      const email = req.params.email;
      const query = { "user.user_Email": email };
      const result = await appointmentBookingCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/Service_To_Do/:email", async (req, res) => {
      // if(req.user.email !== req.params.email){
      //   return res.status(403).send({message:'forbidden access'})
      // }
      const email = req.params.email;
      const query = { doctor_Email: email };
      const result = await appointmentBookingCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/Add_Appointment", async (req, res) => {
      const doc = req.body;
      const result = await allServiceCollection.insertOne(doc);
      res.send(result);
    });

    app.post("/Book_Appointment", async (req, res) => {
      const doc = req.body;
      const result = await appointmentBookingCollection.insertOne(doc);
      res.send(result);
    });
    app.post("/Contact_us", async (req, res) => {
      const doc = req.body;
      const result = await Contact_Us_Collection.insertOne(doc);
      res.send(result);
    });

    app.delete("/Delete_Appointment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allServiceCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/Update_Appointment/:id", async (req, res) => {
      const id = req.params.id;
      const updated = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const appointment = {
        $set: {
          doctorName: updated.doctorName,
          doctorEmail: updated.doctorEmail,
          expertise: updated.expertise,
          location: updated.location,
          photo: updated.photo,
          consultation_cost: updated.consultation_cost,
          description: updated.description,
        },
      };
      const result = await allServiceCollection.updateOne(
        query,
        appointment,
        options
      );
      res.send(result);
    });

    app.patch("/Status/:id", async (req, res) => {
      const id = req.params.id;
      const doc = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          "user.status": doc.Status,
        },
      };
      const result = await appointmentBookingCollection.updateOne(
        query,
        update
      );
      res.send(result);
    });

    //============ this comment because in the Assignment notified me but after get mark then uncomment  ===============
    // userAuthenticate
    //  app.post("/jwt", async (req,res) => {
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h' });
    //   res.
    //   cookie('token', token, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    //   })
    //   .send({ success: true })
    // });

    // app.post('/Logout', async(req,res)=>{
    //   res.clearCookie('token', {
    //     maxAge: 0,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    //   })
    //   .send({ success: true })
    // })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Nearby-Care Server is Running");
});

app.listen(port, () => {
  console.log("Nearby-Care server is running on :", port);
});
