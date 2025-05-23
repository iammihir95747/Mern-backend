const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");


dotenv.config();

const app = express();


app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/auth', require('./Routes/authRoutes')); 

// app.get('', async(req,res)=>{
//   res.send("server is running")
// });

try{
  app.get('', async(req,res)=>{
    res.send("server is running")
  });
}
catch(err){
  console.log("Some server error happend!");
}

app.get('/register', async(req,res)=>{
  res.send("Register Route is running")
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
