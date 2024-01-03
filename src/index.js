const express = require("express");
const bodyParser = require("body-parser");

const { PORT } = require('./config/serverConfig');
const apiRoutes = require('./routes/index');
const db = require('./models/index');

const setupAndStartServer = async () => {
    //create the express object
    const app = express();
    
    // Setting the middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));

    app.use('/api', apiRoutes);
    
    app.listen(PORT, async () => {  
        console.log(`Server Started at ${PORT}`);
        if(process.env.DB_SYNC){
            db.sequelize.sync({alter: true});
        }
    });
}

setupAndStartServer();