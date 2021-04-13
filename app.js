//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-keshav:mongo0pro@cluster0.ebd7r.mongodb.net/todolistdb",{ useUnifiedTopology: true,  useNewUrlParser: true})

const itemSchema = {
  task : String
};


const Item = mongoose.model("Item",itemSchema);

const Item1 = new Item ({
   task : "Learn"
})
const Item2 = new Item ({
   task : "Code"
})
const Item3 = new Item ({
   task : "Repeat"
})

const defaultItems = [Item1,Item2,Item3];

const listSchema = {
  name : String,
  items : [itemSchema]
}

const List = mongoose.model("List",listSchema);

// Item.insertMany(defaultItems,function(err){
//   if(err)
//   console.log(err);
//   else
//   console.log("Successfully Added");
// })

// Item.find({}, function(err,results){
//   if(err)
//   console.log(err);
//   else
//   console.log(results);
// })

app.get("/", function(req, res) {
  Item.find({}, function(err,results){

    if(results.length === 0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err)
        console.log(err);
        else
        console.log("Successfully Added");
      })
      res.redirect("/")
    }
    else
    res.render("list", {listTitle: "Today", newListItems: results});
  })




});

app.post("/", function(req, res){

  const taskName = req.body.newItem;
  const currentList = req.body.list;
  const newTask = new Item ({
    task : taskName
  })


   if(currentList === "Today")
   {
     newTask.save()
     res.redirect("/");
   }
   else{
     List.findOne({name : currentList},function(err,results){
       results.items.push(newTask);
       results.save();
       res.redirect("/" + currentList)
     })
   }

  });

app.post("/delete", function(req,res){

  const delId = req.body.checkbox;
  const targetList = req.body.targetList;
//console.log(targetList);
  //console.log(delId);
  if(targetList === "Today")
{
    Item.deleteOne({_id : delId},function(err){
    if(!err)
    res.redirect("/");
    })

}

else{
      List.findOneAndUpdate( {name: targetList},   {$pull: { items: {_id: delId } } },   function(err,results){
        if(!err)
        res.redirect("/" + targetList);

      })

}

});


app.get("/:customListName", function(req,res){
  listName =  req.params.customListName;
  listName = _.capitalize(listName);
  List.findOne({name : listName},function(err,results){
    if(err)
    console.log(err);
    else
    {
      if(results)
      {
        res.render("list", {listTitle: listName, newListItems: results.items})
      }
      else
      {
        const List1 = new List({
          name : listName,
          items: defaultItems
        });
        List1.save();
        res.redirect("/" + listName)
      }
    }
  })


})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
