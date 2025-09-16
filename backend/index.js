const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userModel = require('./models/usermodel');

const app = express();
app.use(express.json());
app.use(cors());


mongoose.connect("mongodb://127.0.0.1:27017/smartfit_db");

app.post("/login", async (req, res) => {
    const { email, password } = req.body;   
    userModel.findOne({ email:email})
    .then(user => {
        if(user) {
            if(user.password === password) {
                res.json({ message: "Login successful", user: user });
            } else {
                res.json({ message: "Invalid password" });
            }
        }else{
            res.json({ message: "User not found" });
        }
    })
});

app.post("/register", (req, res) => {
    userModel.create(req.body)
        .then(data => res.json(data))
        .catch(err => res.json(err));
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

