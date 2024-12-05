const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

mongoose
  .connect(
    "mongodb+srv://hardikamarlapudi:ogPj7XUn4pWSsgbM@cluster1.wah4d.mongodb.net/Books?retryWrites=true&w=majority&appName=Cluster1"
  )
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("couldn't connect to mongodb", error);
  });
const librarySchema = new mongoose.Schema({
  title: String,
  description: String,
  main_image: String,
});

const Book = mongoose.model("Book", librarySchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/api/books", async (req, res) => {
  const books = await Book.find();
  res.send(books);
});

app.get("/api/books/:id", async (req, res) => {
  const book = await Book.findOne({ _id: id });
  res.send(book);
});

app.post("/api/books", upload.single("img"), async (req, res) => {
  const result = validateBook(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const book = new Book({
    title: req.body.title,
    description: req.body.description,
  });

  if (req.file) {
    book.main_image = "images/" + req.file.filename;
  }

  const newBook = await book.save();
  res.send(newBook);
});

app.put("/api/books/:id", upload.single("img"), async (req, res) => {
  const result = validateBook(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  let fieldsToUpdate = {
    title: req.body.title,
    description: req.body.description,
  };

  if (req.file) {
    fieldsToUpdate.main_image = "images/" + req.file.filename;
  }

  const wentThrough = await Book.updateOne(
    { _id: req.params.id },
    fieldsToUpdate
  );

  const updatedBook = await Book.findOne({ _id: req.params.id });
  res.send(updatedBook);
});

app.delete("/api/books/:id", async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  res.send(book);
});

const validateBook = (book) => {
  const schema = Joi.object({
  
    title: Joi.string().min(3).required(),
    description: Joi.string().min(5).required(),
  });

  return schema.validate(book);
};

// app.listen(3001, () => {
//   console.log("Server Listening on port 3001 ");
// });


// Start the server
const PORT = process.env.PORT || 3001;
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/api/books`);
});
