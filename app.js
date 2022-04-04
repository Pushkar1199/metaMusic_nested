const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql").graphqlHTTP;
const { pool } = require("./Db/Db");

const app = express();

app.use(bodyParser.json());

const { makeExecutableSchema } = require("graphql-tools");

const typeDefs = `
type metadata {
    key : String!
    value: String!
}
type music {
    id: String!
    title: String!
    album: String!
    artist: String!
    year: Int!
    metaData : [metadata]
}
type Query {
    music(id : String!) : music
    meta : [metadata]
}`;

const resolvers = {
  Query: {
    music: async (_, args) => {
      const ID = args.id;
      //console.log(ID);
      try {
        let m = (await pool.query(`SELECT * FROM music WHERE id = $1 `, [ID]))
          .rows[0];
        //console.log(m);
        if (!m) {
          throw new Error("No Music Found");
        }
        return m;
      } catch (error) {
        console.log(error.message);
      }
    },
    meta: () => {
      console.log("All metas");
    },
  },
  music: {
    metaData: async (music) => {
      console.log("nested query is executed with ", music);
      let metaData = (
        await pool.query(`SELECT key,value FROM metadata WHERE music_id = $1`, [
          music.id,
        ])
      ).rows;

      return metaData;
    },
  },
};
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

app.use(
  "/graphql",
  graphqlHttp({
    schema: schema,
    graphiql: true,
  })
);

app.get("/", (req, res, next) => {
  res.send(
    `<h2><a href = '/graphql'>CLICK TO CONTINUE TO UI </a></h2><h3><a href = "https://github.com/Pushkar1199/music-lib/blob/master/README.md">README</a></h3>`
  );
});

app.listen(process.env.PORT || 5000);

//,metaData:[{key:"string3",value:"string3"},{key:"string31",value:"string31"}]
