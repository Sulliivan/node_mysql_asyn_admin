const express = require ('express');
const path = require ("path");  // utilise les fichiers
const mysql = require ("mysql"); // donne accé a la base de donnée
const util = require ("util");
const methodOverride = require ('method-override'); // pouvoir transformer le nom des methodes dans Node


//////////////////////////////////////
// rappel pour connection a la base de donner 
require('dotenv').config(); // pouvoir utiliser le fichier env qui est un fichier caché "mdp, info connection"

//////////////////////////////////////
// Express - Creer un serveur local - appliquer le crud > permet de creer les methodes get / post / put / delete
const app = express() 

//////////////////////////////////////
//method over  utilisation de la methode
app.use(methodOverride('_method'))

//////////////////////////////////////
// Ejs  moteur de templating sert à compiler les differentes pages et à afficher les donnée de la base de donnée
app.set ('view engine', 'ejs');

//////////////////////////////////////
// Middleware 
app.use(express.json())    // permet à express de lire les fichiers json
app.use(express.urlencoded({extended: false})) // permet à express de lire les info transmise dans l'url 

//////////////////////////////////////
// Static
app.use(express.static(path.join(__dirname, 'public')));  // permet a epress d'utiliser le fichier static ( css, img...)


//////////////////////////////////////////////
// Mysql  // permet de creer la connection base entre la base de donnée et l'appplication
const db = mysql.createConnection ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    // multipleStatements: true
});

db.connect((err) => {
    if (err) { throw err;}
    console.log('Connecté à la base MySQL');
});

const query = util.promisify(db.query).bind(db)
    global.db = db; // donne accés a la connection de l'appli a la base de donnée
    global.query = query;

// routes
app.get ("/", async (req, res) => {
    //const query =["SELECT * FROM factories","SELECT * FROM energies"];
    const factories = await query("SELECT * FROM factories")
    const energies = await query("SELECT * FROM energies")

    res.render("index",{factories, energies});
/* db.query(query, (err, result) => {
    res.render("index", { factories: result[0], energies: result[1]});
 }); */
});

app.get ("/create", async (req, res) => {
    const factories = await query("SELECT * FROM factories")
    const energies = await query("SELECT * FROM energies")

    res.render("edit",{factories, energies});
});

app.post ("/create", async (req, res) => {

    const {name, factory, energy} = req.body
    
    try {
            await query('INSERT INTO cars (name, factoryId, energyId) value(?, ?, ?)',[name, factory, energy]);
        res.send('ok')

    } catch(err) {
        res.send(err)
    }

   // res.redirect("/");
});


///////////////////////////////////////////
// port utilisé par express en serveur local
app.listen(2000, function() {
    console.log('le serveur ecoute le port 2000');
})

