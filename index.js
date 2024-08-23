const express = require('express');
const cors=require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const server = "127.0.0.1:27017";
const db = "signupdb";


app.use(cors());
// Middleware to parse JSON bodies
app.use(bodyParser.json());

mongoose.connect(`mongodb://${server}/${db}`)
    .then(() => {
        console.log("Database connection is successful");
    })
    .catch((error) => {
        console.error("Database connection failed: " + error);
    });
    const staffSchema = new mongoose.Schema({
        staffname: { type: String, required: true },
        password: { type: String, required: true },
    });


    const bookSchema = new mongoose.Schema({
        name: { type: String, required: true },
        price: { type: Number, required: true },
        status: { type: String, required: true }
    });
    
    const userSchema = new mongoose.Schema({
        username: { type: String, required: true },
        password: { type: String, required: true },
    });
    
    const  Book = mongoose.model('Book', bookSchema);
    const User = mongoose.model('User', userSchema);
    const Staff = mongoose.model('Staff',staffSchema);

    app.get("/", ( req, res) => {
    res.send("Hello World");
});


app.post("/test", ( req, res)=>{
    res.send("test route hit");
})

app.post('/staffsignup', async (req, res) => {
    const { staffname, password } = req.body;
    console.log('Request body:', req.body);

    if (!staffname || !password) {
        return res.status(400).send({ message: "staffname and password are required" });
    }

    const newStaff = new Staff({ staffname, password });
    try {
        await newStaff.save();
        res.status(201).send(newStaff);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post("/staffsignin", async (req, res) => {
    const staffname = req.body.staffname;
    const password = req.body.password;
    try {
        const staff = await Staff.findOne({ staffname, password });
        if (staff) {
            console.log('staff found:',staff);
          res.status(200).send({ message: "Sign-in successful" });
        } else {
            console.log('invalid staff or password');
          res.status(401).send({ message: "Invalid staffname or password" });
        }
      } catch (err) {
        console.log('error during sign-in:',err);
        res.status(500).send(err);
      }
    });


app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    console.log('Request body:', req.body);

    if (!username || !password) {
        return res.status(400).send({ message: "Username and password are required" });
    }

    const newUser = new User({ username, password });
    try {
        await newUser.save();
        res.status(201).send(newUser);
    } catch (err) {
        res.status(500).send(err);
    }
});
  
  

app.post("/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            console.log('user found:',user);
          res.status(200).send({ message: "Sign-in successful" });
        } else {
            console.log('invalid email or password');
          res.status(401).send({ message: "Invalid email or password" });
        }
      } catch (err) {
        console.log('error during sign-in:',err);
        res.status(500).send(err);
      }
    });
    app.post("/addbook", (req, res) => {
        console.log("Received addbook request:", req.body);
        const newbook = new Book({
            name: req.body.name,
            price: Number(req.body.price), // Convert price to a number
            status: req.body.status
        });
        newbook.save()
            .then(() => {
                console.log("Book data saved to MongoDB");
                res.send("Book added successfully");
            })
            .catch((error) => {
                console.error("Error saving book data:", error);
                res.status(500).send("Error saving book data");
            });
    });
    
    app.post("/takebook", async (req, res) => {
        console.log("Received takebook request:", req.body);
    
        try {
            const bookReturns = await Book.findOne({
                name: req.body.name,
                price: Number(req.body.price), 
                status: "available"
            });
            console.log("book found:",bookReturns)
            if (!bookReturns) {
                console.log("Book not found");
                return res.status(404).send("Book not found");
            }
    
            if (bookReturns.status !== "available") {
                console.log("Book is not available");
                return res.send("This book is not available");
            }
    
            console.log("Trying to send book and set status");
            bookReturns.status = "not available";
            await bookReturns.save();
    
            res.send("Book taken successfully");
        } catch (error) {
            console.error("Error taking book:", error);
            res.status(500).send("Error taking book");
        }
    });


    app.post("/deletebook", async (req, res) => {
        console.log("Received delete book request:", req.body);
    
        try {
            const deleteResult = await Book.deleteOne({
                name: req.body.name,
                price:  Number(req.body.price), 
                status: req.body.status
            });
    
            console.log("Delete result:", deleteResult);
    
            if (deleteResult.deletedCount === 0) {
                console.log("Book not found");
                return res.status(404).send("Book not found");
            }
    
            console.log("Book deleted successfully");
            res.send("Book deleted successfully");
        } catch (error) {
            console.error("Error deleting book:", error);
            res.status(500).send("Error deleting book");
        }
    });
   
    app.post("/returnbook", async (req, res) => {
        console.log("Received returnbook request:", req.body);
    
        try {
            // Check if the book exists before attempting to update
            const bookToReturn = await Book.findOne({
                name: req.body.name,
                price: Number(req.body.price),
                status: "not available"
            });
    
            console.log("Book found for returning:", bookToReturn);
    
            if (!bookToReturn) {
                console.log("Book not found or already available");
                return res.status(404).send("Book not found or already available");
            }
    
            // Proceed with updating the status
            const updatedBook = await Book.findOneAndUpdate(
                {
                    name: req.body.name,
                    price: Number(req.body.price),
                    status: "not available"
                },
                { $set: { status: "available" } }, // Update status to "available"
                { new: true } // Return the updated document
            );
    
            console.log("Book found and updated:", updatedBook);
    
            if (!updatedBook) {
                console.log("Book not found or already available");
                return res.status(404).send("Book not found or already available");
            }
    
            console.log("Book status set to available");
            res.send("Book returned successfully");
        } catch (error) {
            console.error("Error returning book:", error);
            res.status(500).send("Error returning book");
        }
    });
    
       

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
