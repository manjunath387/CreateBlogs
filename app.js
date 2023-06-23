//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const multer = require('multer');
const app = express();
const fs = require('fs');
dotenv.config(".env");

// database connection
if (mongoose.connect(`mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.8svlls4.mongodb.net/?retryWrites=true&w=majority`)) {
  console.log("database connected");
}else{console.log("there is an error in database connections")}

// define shcema for the blog database

const blogShema = new mongoose.Schema({
  title: String,
  content: String,
  Image: {
    filename: String,
  originalname: String,
  buffer: Buffer
  }
});

const Blog = mongoose.model("Blog", blogShema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", async (req, res) => {
  try {
    const blogPosts = await Blog.find({});
    res.render("home", { NewPosts: blogPosts });
    
    // res.send(blogPosts);
  } catch (error) {
    console.log(error);
  }
});

app.get("/about", (req, res) => {
  res.render("about",{AContent:aboutContent});
})
app.get("/contact", (req, res) => {
  res.render("contact",{CContent:contactContent});
})

app.get("/compose", (req, res) =>{
  res.render("compose");
})


const upload = multer({ dest: 'uploads/' });

app.post("/compose", upload.single('postImage'), async (req, res) => {
  const file = req.file;
  const post = new Blog({
    title: req.body.postTitle,
    content: req.body.postBody,
    Image: {
      filename: file.filename,
      originalname: file.originalname,
      buffer: fs.readFileSync(file.path)
    }
  });

  try {
    await post.save();
    console.log('Image and blog post stored in MongoDB');
    res.redirect('/');
  } catch (error) {
    console.error('Error storing image and blog post:', error);
    res.send('Error storing image and blog post');
  }
});

app.get('/posts/:topic', (req, res) => {
  const requestTitle = _.lowerCase(req.params.topic);
  
try {
  Blog.find({}).then((blogPosts) => {
   
 blogPosts.forEach((post) => {
    const storedTitle = _.lowerCase(post.title);
    if (storedTitle === requestTitle) {
      
      res.render("post", { fetchPostTitle: post.title, fetchPostBody: post.content,fetchImage:post.Image});
    } 
  })
  
  })
} catch (error) {
  console.log(error);
}
})


app.listen(3000, () => {
  console.log("server is running on 5000");
});




