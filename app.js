const express = require('express');
const graphqlHttp = require('express-graphql');
const schema = require('./schema/schema');
const cors = require('cors');

const app = express();

app.use(cors());
app.use("/graphql", graphqlHttp({
    schema, graphiql: true
}));

app.listen(process.env.PORT || 4000,function(){
    console.log('Server node is running');
});

