const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
var cors = require('cors')

const app = express();
app.use(cors())
app.use(bodyParser.json());


const PORT = 5000;
const URI = 'mongodb+srv://matzsolutions:2VVG2QxBAMub9Oaz@cluster0.gyal2.mongodb.net'


const client = new MongoClient(URI);
client.connect();
const dbName = "healthcare";

const database = client.db(dbName);
console.log("Connected to MongoDB");



app.get('/api/:collectionKeyword', async (req, res) => {

  try {
    const {collectionKeyword}=req.params;
    const collection = database.collection(collectionKeyword);
    const data = await collection.aggregate([
      { $sample: { size: 5 } }
    ]).sort({"name":1}).limit(5).toArray();

    res.json(data);
  } catch (err) {
    console.error(`Something went wrong trying to find the documents: ${err}\n`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to fetch by zip code
app.get('/api/:collectionKeyword/zipCode/:zipCode', async (req, res) => {
  try {
    const {zipCode,collectionKeyword} = req.params; 
    const collection = database.collection(collectionKeyword);
    const data = await collection.find({ zipCode }).sort({"name":1}).limit(7).toArray();
    res.json(data);
  } catch (err) {
    console.error(`Error fetching nursing homes by zip code: ${err}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/api/:collectionKeyword/city/:city', async (req, res) => {
  const { collectionKeyword,city } = req.params;
  try {
    const collection = database.collection(collectionKeyword);
    const data = await collection.find({ city }).sort({"name":1}).limit(5).toArray();
    res.json(data);
  } catch (err) {
    console.error(`Something went wrong trying to find the documents: ${err}\n`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/api/:collectionKeyword/state/:state', async (req, res) => {
  const { collectionKeyword,state } = req.params;
  try {
    const collection = database.collection(collectionKeyword);
    const data = await collection.find({ state }).sort({"name":1}).limit(5).toArray();
    res.json(data);
  } catch (err) {
    console.error(`Something went wrong trying to find the documents: ${err}\n`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/api/:collectionKeyword/search', async (req, res) => {
  try {
    const { collectionKeyword } = req.params;
    const { city, state, zipCode } = req.query;

    let findQuery = {};

    if (city) {
      findQuery.city = city;
    }

    if (state) {
      findQuery.state = state;
    }

    if (zipCode) {
      findQuery.zipCode = zipCode;
    }

    const collection = database.collection(collectionKeyword);
    const data = await collection.find(findQuery).sort({"name":1}).limit(7).toArray();

    res.json(data);
  } catch (error) {
    console.error("Error in search API:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get('/api/:collectionKeyword/city_state', async (req, res) => {
  try {
    const { collectionKeyword } = req.params;
    const { city, state } = req.query;
    let findQuery = {};
    if (city) {
      findQuery.city = city;
    }
    if (state) {
      findQuery.state = state;
    }
    const collection = database.collection(collectionKeyword);
    const data = await collection.find(findQuery).sort({"name":1}).limit(7).toArray();
    res.json(data);
  } catch (error) {
    console.error("Error in search API:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get('/api/:collectionKeyword/fullAddress', async (req, res) => {
  try {
    const { collectionKeyword } = req.params;
    const { fullAddress } = req.query;
    let findQuery = {};
    if (fullAddress) {
      findQuery.fullAddress = fullAddress;
    }
    const collection = database.collection(collectionKeyword);
    const data = await collection.find(findQuery).sort({"name":1}).limit(5).toArray();
    res.json(data);
  } catch (error) {
    console.error("Error in search API:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Example route for searching by exact name
app.get('/api/:collectionKeyword/searchByName/:name', async (req, res) => {
  try {
    const { collectionKeyword, name } = req.params;
    const findQuery = { name: { $regex: new RegExp(`^${name}$`, 'i') } };
    const collection = database.collection(collectionKeyword);
    const data = await collection.find(findQuery).toArray();
    res.json(data);
  } catch (error) {
    console.error("Error in searchByName API:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});