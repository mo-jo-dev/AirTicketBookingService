const express = require("express");
const bodyParser = require("body-parser");

const { PORT } = require('./config/serverConfig');
const apiRoutes = require('./routes/index');
const db = require('./models/index');

const setupAndStartServer = async () => {
    //create the express object
    const app = express();

    app.use('/api', apiRoutes);

    // Setting the middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));

    app.listen(PORT, async () => {  
        console.log(`Server Started at ${PORT}`);
        if(process.env.DB_DSYNC){
            db.sequelize.sync({alter: true});
        }
    });
}

setupAndStartServer();