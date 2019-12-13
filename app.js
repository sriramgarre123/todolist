//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://sriramgarre123:8188789895@cluster0-s8gxe.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true});

const itemSchema = new mongoose.Schema( {
  name: String
});
const Item = mongoose.model("Item",itemSchema);

const item = new Item ({
  name:"eat food"
});


const item1 = new Item ({
  name:"eat good food"
});

const defaultItems = [item , item1];

const ListSchema ={
  name:String,
  items : [itemSchema]
}

const List = mongoose.model("List",ListSchema)
app.get("/", function(req, res) {
 

  Item.find({}, function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
      
        }else{
          console.log("sucess");
        }
      });
      res.redirect("/")
     }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems });
     }
  })
});



app.get("/:customListName",function(req,res){
  customListName = _.capitalize(req.params.customListName)

List.findOne({name: customListName}, function(err,foundList){
  if(!err){
    if (!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      
      })
      list.save();
      res.redirect("/"+ customListName);
        // console.log(customListName)

    }else{
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items })
    }
  }
})


})




app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  // console.log(listName)
  const item = new Item({
    name: itemName
  });
  
  if (listName === "Today"){
  item.save();
  res.redirect("/");
  }else {
    List.findOne({name :listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req,res){
  const checkedItemId = (req.body.checkbox);
  const listName = req.body.ListName;
  console.log(listName);
  setTimeout(function(){ 
    
    if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("sucessfully deleted");
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkedItemId}}}, function(err,foundList){
      if(!err){
                res.redirect("/"+listName);
              }
    });
  }
  
},1000);

 

}) 

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});


