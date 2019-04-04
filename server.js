var express = require("express");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000 ;

// Initialize Express
var app = express();

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

if(process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect("mongodb://localhost/Articles-db", { useNewUrlParser: true });
}



// Routes

// Scrape the articles on WSJ
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.wsj.com").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

   //Grab every H3 headline
    $("h3.wsj-headline").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.img = $(this)
        .children("a")
        .attr("img");
       
        //console.log(result.title);
        //console.log(result.link);
      // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
     
    });
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
 
  db.Article.create(req.body)
    .then(function(dbArticle) {
     
      return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push:{ note: dbArticle._id }}, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


app.post("/", function (req,res){
 
    
  db.Article.find({}).then((articles) => {
    for (let i = 0; i < articles.length; i++) {
        if (article[i].title === result.title) {
            break;
        }
    }

    db.Article.create(result)
        .then(function (dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, log it
            console.log(err);
        });
})
});

// Start the server
//app.listen(PORT, function() {
  //console.log("App running on port " + PORT + "!");
//});
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port "+PORT+ "in %s mode", this.address().port, app.settings.env);
});
