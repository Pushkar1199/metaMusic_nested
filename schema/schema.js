const {pool} = require("../Db/Db")

const { makeExecutableSchema } = require('graphql-tools')

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
    music(musicId : String!) : music
    meta : [metadata]
}`


const resolvers = {
    Query : {
        music : async (id) => {
            const ID = id ;
        try {
            let m = (await pool.query(`SELECT * FROM music WHERE id = $1 `, [ID]))
            .rows;
            if (!m) {
                console.log(m);
            throw new Error("No Music Found");
            }
            return m;
        } catch (error) {
            console.log(error.message);
        }
    },
    meta : () => { console.log("All metas")}
    },
    music : {
        metaData : async (musicid) => {

            console.log('metas of ',musicid);
            let metaData = (
                
                await pool.query(`SELECT key,value FROM metadata WHERE music_id = $1`, [
                  musicid
                ])
              ).rows;

              return metaData;
        }
    }
} 
const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  })

module.exports = {schema} 
