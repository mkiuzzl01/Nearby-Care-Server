const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.VITE_DB_NAME}:${process.env.VITE_DB_PASS}@cluster0.rbychrh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    const allServiceCollection = client.db('Nearby_Care').collection('All_Services') ;
    const appointmentBookingCollection = client.db('Nearby_Care').collection('Appointment_Booking');

    app.get('/Popular_Services', async(req,res)=>{
        const result = await allServiceCollection.find().toArray();
        res.send(result);
    })

    app.get('/View_Details/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id:new ObjectId(id)}
        const result = await allServiceCollection.findOne(query);
        res.send(result)
        
    })
    
    app.post('/Add_Appointment', async (req,res)=>{
        const doc = req.body; 
        const result = await allServiceCollection.insertOne(doc);
        res.send(result)
    })

    app.post('/Manage_Appointment/:email', async (req,res)=>{
        const email = req.params.email;
        const query = {doctorEmail:email} 
        const result = await allServiceCollection.find(query).toArray();
        res.send(result)
    })
    app.delete('/Delete_Appointment/:id', async (req,res)=>{
        const id = req.params.id;
        const query = {_id:new ObjectId(id)} 
        const result = await allServiceCollection.deleteOne(query);
        res.send(result)
    })

    app.put('/Update_Appointment/:id', async (req,res)=>{
        const id = req.params.id;
        const updated = req.body;
        const query = {_id:new ObjectId(id)} 
        const options = {upsert:true};
        const appointment = {
            $set:{
                doctorName:updated.doctorName,
                doctorEmail:updated.doctorEmail,
                expertise:updated.expertise,
                location:updated.location,
                photo:updated.photo,
                consultation_cost:updated.consultation_cost,
                description:updated.description,
            },
        }
        const result = await allServiceCollection.updateOne(query,appointment,options);
        res.send(result)
    })

    

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get("/", (req, res) => {
  res.send("Nearby-Care Server is Running");
});

app.listen(port,()=>{
    console.log('Nearby-Care server is running on :', port);
})
