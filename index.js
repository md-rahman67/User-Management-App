const dotenv = require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const { faker, tr } = require("@faker-js/faker");
const methodOverride = require('method-override');
const { v4: uuidv4 } = require("uuid");

const path = require("path"); // to access views and public folder from index.js we require "path"

const app = express();
const port = 8080;

app.use(methodOverride('_method')); // to use PUT and PATCH req
app.use(express.urlencoded({ extended: true })); // to parse POST req data

app.set("view engine, ejs"); // to render ejs file set "view engine" to "ejs"

app.set("views", path.join(__dirname, "views")); // to set path for views folder so index.js can access from anywhere
app.use(express.static(path.join(__dirname, "public"))); // to set public folder path so index.js can access public folder from anywhere

const connection = mysql.createConnection({ // to create connect between node and mysql databases
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD
});

let getRandomUser = () => { // to get fake user data we require "@faker-js/faker"
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password()
  ];
}






// --------------------------- SERVER LISTEN--------------------------------------
// GWT - user counts
app.get("/", (req, res) => {
  let q = `SELECT COUNT(*) FROM user`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result;
      res.render("home.ejs", { count });
    })
  } catch (error) {
    res.send(`some error in database: ${error}`);
  }

})


// GET - show all users details
app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let users = result;
      res.render("user.ejs", { users });
    })
  } catch (error) {
    res.send(`some error in database: ${error}`);
  }

});

//GET - form to edit username
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = ?`;
  let value = id;

    connection.query(q, value, (err, result) => {
      if (err) {
        return res.send(`some error in database: ${err}`);
      }
      let indv = result[0];
      res.render("edit.ejs", { indv })
    })
})

// PATCH REQ - to edit username in db
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let username = req.body.username;
  let formPass = req.body.password;

  console.log(formPass);
  console.log(username);

  let q1 = `SELECT password FROM user WHERE id = ?`;
  let value = id;

  connection.query(q1, value, (err, result) => {
    if (err) {
      return res.send(`some error in database: ${err}`);
    }

    if (formPass === result[0].password) {

      let q2 = `UPDATE user SET username = ? WHERE id = ?`;
      let values = [username, id];

      connection.query(q2, values, (err, result) => {
        if (err) {
          return res.send(`some error in database: ${err}`);
        }
        console.log(result);
        res.redirect("/user");
      })
    } else {
      res.send("Wrong Password! try again later");
    }

  })

})

//GET- form to add new user
app.get("/user/add", (req, res) => {
  res.render("add.ejs");
})

// POST REQ - to add/register a new user
app.post("/user", (req, res) => {
  let { username, email, password } = req.body;

  let q = `INSERT INTO user (id, username,  email, password) VALUES (?, ?, ?, ?)`;
  let values = [uuidv4(), username, email, password];

  try {
    connection.query(q, values, (err, result) => {
      if (err) {
        return res.send(`some error in database: ${err}`);
      }

      if (result) {
        res.redirect("/user");
      }
    })
  } catch (error) {
    res.send(`some error in database: ${error}`);
  }

  console.log(username);
  console.log(email);
  console.log(password);
})

//GET REQ - to get form to delete user
app.get("/delete/:id/:username", (req, res) => {
  let { id, username } = req.params;
  res.render("delete.ejs", { username, id });
})

// DELETE REQ - to delete individual user
app.delete("/delete/:id", (req, res) => {
  let { id } = req.params;

  let { email: formEmail, password: formPass } = req.body;

  let q1 = `SELECT * FROM user WHERE id=?`;
  let value = id;

  connection.query(q1, value, (err, result) => {
    if (err) {
      return res.send(`some error in database: ${err}`);
    }

    if (formEmail === result[0].email && formPass === result[0].password) {

      let q2 = `DELETE FROM user WHERE id=?`;

      connection.query(q2, value, (err, result) => {
        if (err) {
          return res.send(`some error in database: ${err}`);;
        }
        console.log(result);
        res.redirect("/user");
      })
    } else {
        res.send("Wrong!! check your email & password again and try again later.");
    }

  })


})

app.listen(port, () => {
  console.log(`App is listening to port: ${port}`);
})
