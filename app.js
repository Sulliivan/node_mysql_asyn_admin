const express = require('express');
const path = require("path"); // utilise les fichiers
const mysql = require("mysql"); // donne accé a la base de donnée
const util = require("util");
const methodOverride = require('method-override'); // pouvoir transformer le nom des methodes dans Node
const fileUpload = require ('express-fileupload')

//////////////////////////////////////
// rappel pour connection a la base de donner 
require('dotenv').config(); // pouvoir utiliser le fichier env qui est un fichier caché "mdp, info connection"

//////////////////////////////////////
// Express - Creer un serveur local - appliquer le crud > permet de creer les methodes get / post / put / delete
const app = express()

//////////////////
app.use(fileUpload());

//////////////////////////////////////
//method over  utilisation de la methode
app.use(methodOverride('_method'))

//////////////////////////////////////
// Ejs  moteur de templating sert à compiler les differentes pages et à afficher les donnée de la base de donnée
app.set('view engine', 'ejs');

//////////////////////////////////////
// Middleware 
app.use(express.json()) // permet à express de lire les fichiers json
app.use(express.urlencoded({
    extended: false
})) // permet à express de lire les info transmise dans l'url 

//////////////////////////////////////
// Static
app.use(express.static(path.join(__dirname, 'public'))); // permet a epress d'utiliser le fichier static ( css, img...)


//////////////////////////////////////////////
// Mysql  // permet de creer la connection base entre la base de donnée et l'appplication
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    // multipleStatements: true
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connecté à la base MySQL');
});

const query = util.promisify(db.query).bind(db)
global.db = db; // donne accés a la connection de l'appli a la base de donnée
global.query = query;

// routes
app.get("/", async (req, res) => {
    //const query =["SELECT * FROM factories","SELECT * FROM energies"];
    try{
        const factories = await query("SELECT * FROM factories")
        const energies = await query("SELECT * FROM energies")
    
        res.render("index", {
            factories,
            energies
        });

    }catch (err){
        res.send (err)
    }
    /* db.query(query, (err, result) => {
        res.render("index", { factories: result[0], energies: result[1]});
     }); */
});

app.get("/create", async (req, res) => {
    const factories = await query("SELECT * FROM factories")
    const energies = await query("SELECT * FROM energies")

    res.render("edit", {
        factories,
        energies
    });
});


//Methode POST pour creer une nouvelle fiche
app.post("/create", (req, res) => {
    if (!req.files){
        return res.status(400).send('no files were upload');
    }
    let name = req.body.name
    let imageUpload = req.files.image
    let image = `public/image/${imageUpload.name}`

    if (imageUpload.mimetype === "image/jpeg" || imageUpload.mimetype === "image/gif" || imageUpload.mimetype === "image/png") {
        imageUpload.mv(`public/image/${imageUpload.name}`, async function(err) {
            if (err){
              return res.status(500).send(err);
            }
            try {
                  await query('insert into cars (name, image) values (?,?);',[name, image]); 
                  res.redirect("/")
               // res.send('File uploaded!');
              }catch (err){
                  res.send(err)
              }

            }  
            );
        } else {
           message = "fichier invalide"
           res.render('edit',{message})
       }
        // console.log(imageUpload);
       // await query('INSERT INTO cars (name, factoryId, energyId) value(?, ?, ?)', [name, factory, energy]);
            //res.send('ok')
});


///////////////////////////////////////////
// port utilisé par express en serveur local
app.listen(2000, function () {
    console.log('le serveur ecoute le port 2000');
})