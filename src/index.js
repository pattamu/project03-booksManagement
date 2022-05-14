const express = require('express');
const bodyParser = require('body-Parser');
const route = require('./routes/routes.js')
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://nas:nas1234@cluster0.fci9p.mongodb.net/group25Database", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route);

app.listen(process.env.PORT || 3000, function (){
    console.log('Express app running on port: ' + (process.env.PORT || 3000))
});



