const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express();
app.use(cors());
app.use(express.json());

// Watch-shop-firebase-key

var admin = require("firebase-admin");



const port = process.env.PORT||5000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qrydk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;



const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db("Watch-shop");
    const Products = database.collection("watches");
    const Orders = database.collection("orders");
    const Users = database.collection("users");
    const Reviews = database.collection("reviews");


    // ==================== User Operations =====================

    // user posting in Db for signUp operation

    app.post('/addUser',async (req,res)=>{

      const user = req.body.user;
      console.log("user data is : ",user);
      const result = await Users.insertOne(user);
      console.log(result);
      res.json(result);

    })

     // User  upserting in Db for Google or other 3rd party signin method

     app.put('/addUser',async (req,res)=>{
      const user = req.body.user;
      console.log("from put user ",user);
      const filter = {email: user.email};
      const options ={upsert:true};
      const updateDoc = {$set: user};
      const result = await Users.updateOne(filter,updateDoc,options);
      res.json(result);
    })


       // Checking if user is admin

    app.get('/user/:email',async(req,res)=>{
      const email = req.params?.email;
      console.log("email is ",email);
      const query = {email:email};
      const user = await Users.findOne(query);
      let isAdmin = false;
      if(user?.role === 'admin'){
        isAdmin = true ;
      }
     
      res.json({admin:isAdmin})
    })


     // Adding Admin in Db with checking admin
     app.put('/users/admin', async (req,res)=>{

      const email = req.body.email;
      const requestedby = req.body.userEmail;
      console.log("requested by :",requestedby);
      console.log("making admin :",email);
      const requester = requestedby;
      if(email){
        const requesterAccount = await Users.findOne({email:requester});
        if(requesterAccount.role ==='admin'){
          const filter = {email:email};
          const updateDoc = { $set: { role: 'admin' }};
          const result = await Users.updateOne(filter,updateDoc);
          console.log(email,"is now admin");
          res.json(result);
        }
        else{
          console.log("you are not admin !!")
          res.status(403).json({message:'you donot have access to this page'})
          
        }
      }
     
    })


// ================================ product  Operations ================================================


    //ADD Product database

    app.post('/addProduct',async (req,res)=>{

      const watch = req.body;
      console.log("new Watch data is : ",req.body);
      const result = await Products.insertOne(watch);
      console.log(result);
      res.json(result);

    })


     // View  Products from Db
     app.get('/products',async (req,res)=>{
      console.log("find products hitted");
       const result =  Products.find({});
       const products = await result.toArray();
       res.json(products);
    })

      //Find Product  from Db by _id
   app.get('/product/:Id',async (req,res)=>{
    const {Id}= req.params;
   console.log("find product by id is : ",Id);
    const result = await  Products.findOne( { _id: ObjectId(Id) });
    res.json(result);
 })


     //Update Product by id in Db

     app.put("/update/product/:id", async (req, res) => {
      const { id } = req.params;
      console.log(" Product update request id is : ", id);
      const watch =  req.body.sendData;
      console.log(" product update request status is : ", watch);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {$set:
         {
            watchName : watch.watchName ,
            brand: watch.brand,
            watchImage: watch.watchImage,
            watchPrice: watch.watchPrice,
            watchDescription: watch.watchDescription,
            rating:watch.rating,
            rated:watch.rated,
        }, };
      console.log("updated Cart is : ", updateDoc);
      const result = await Products.updateOne(filter,updateDoc,options);
      console.log("final update cart result is : ", result);
      res.send(result);
    });



// ==================================== Order Operations ===========================================


    //ADD Order 

    app.post('/addOrder',async (req,res)=>{
      const order = req.body;
      console.log("order data is : ",req.body);
      const result = await Orders.insertOne(order);
      console.log(result);
      res.json(result);

    })


     // View All Orders from Db 
     app.get('/orders',async (req,res)=>{
      const result =  Orders.find({});
      const ordersFound = await result.toArray();
      console.log("found orders",ordersFound);
      res.json(ordersFound);
   })


     // View Orders from Db by uid
      
     app.get('/orders/:uid',async (req,res)=>{
      const {uid} = req.params;
      console.log("find Orders hitted",uid);
      const query = { uid: uid };
       const result =  Orders.find(query);
       const ordersFound = await result.toArray();
       console.log("found orders",ordersFound);
       res.json(ordersFound);
    })



      //Update Order Item From Cart by _id

      app.put("/update/cart/:id", async (req, res) => {
        const { id } = req.params;
        console.log(" Status update request id is : ", id);
        const status =  req.body.status;
        console.log(" Status update request status is : ", req);
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {$set: { status : status} };
        console.log("updated Cart is : ", updateDoc);
        const result = await Orders.updateOne(filter,updateDoc,options);
        console.log("final update cart result is : ", result);
        res.send(result);
      });


        //Delete Order Item From Cart by _id

        app.delete("/delete/cart/:id", async (req, res) => {
          const { id } = req.params;
          console.log("request id is : ", id);
          const query = { _id: ObjectId(id) };
          const result =  Orders.deleteOne(query);
          console.log("deleted cart id : ", id);
          res.send(result);
        });
  


  
        // ========================== Review Operations ================================================


      //ADD Review data

      app.post('/addReview',async (req,res)=>{

        const review = req.body;
        console.log("new Watch data is : ",req.body);
        const result = await Reviews.insertOne(review);
        console.log(result);
        res.json(result);
  
      })
  
   

     // View All Reviews view from Db

     app.get('/reviews',async (req,res)=>{
      console.log("find Reviews hitted");
       const result =  Reviews.find({});
       const reviews = await result.toArray();
       res.json(reviews);
    })


       //Get Reviews from Db by Email

       app.get('/reviews/:email',async (req,res)=>{
        const {email} = req.params;
        console.log("find Orders by email hitted",email);
        const query = { creatorEmail: email };
         const result =  Reviews.find(query);
         const ordersFound = await result.toArray();
         console.log("found Reviews",ordersFound);
         res.json(ordersFound);
      })


       //Get single Review from Db by Id for updaate review page

       app.get('/review/:id',async (req,res)=>{
        const {id} = req.params;
        console.log("find Order by id hitted",id);
        const query = { _id: ObjectId(id) };
         const result =  Reviews.find(query);
         const ReviewFound = await result.toArray();
         console.log("found Reviews",ReviewFound);
         res.json(ReviewFound);
      })


      //Update Review by id

      app.put("/UpdateReview/:id", async (req, res) => {
        const { id } = req.params;
        console.log(" Product update request id is : ", id);
        const review =  req.body.sendData;
        console.log(" product update request status is : ", review);
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {$set:
           {
              watchName: review.watchName,
              reviewDescription : review.reviewDescription,
              rating : review.rating
          }, };
        console.log("updated Review is : ", updateDoc);
        const result = await Reviews.updateOne(filter,updateDoc,options);
        console.log("final update Review result is : ", result);
        res.send(result);
      });



         //Delete Single Reviews from Db by Id

         app.delete('/deleteReview/:id',async (req,res)=>{
          const {id} = req.params;
          console.log("Delete Order by id hitted",id);
          const query = { _id: ObjectId(id) };
           const result = await  Reviews.deleteOne(query);
           console.log("Deleted result for Reviews",result);
           res.json(result);
        })

    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server Running at http://localhost:${port}`)
})



// app.get('/users')
// app.post('/users')
// app.get('/user/:id')
// app.put('/user/:id')
// app.delete('/user/:id')