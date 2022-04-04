const { pool } = require("../Db/Db");

// const musics = [
//   {
//     id: "m1",
//     title: "string",
//     album: "string",
//     artist: "string",
//     year: 2020,
//     metaData: [
//       {
//         key: "string",
//         value: "string",
//       },
//     ],
//   },
//   {
//     id: "m2",
//     title: "string2",
//     album: "string2",
//     artist: "string2",
//     year: 2020,
//     metaData: [
//       {
//         key: "string2",
//         value: "string2",
//       },
//     ],
//   },
//   {
//     id: "m3",
//     title: "string3",
//     album: "string3",
//     artist: "string3",
//     year: 2021,
//     metaData: [
//       { key: "string3", value: "string3" },
//       { key: "string31", value: "string31" },
//     ],
//   },
// ];

const Allmusic = async () => {
  try {
    let musicarr = [];
    musicarr = (await pool.query(`SELECT * FROM music `)).rows;

    let metarr = (await pool.query(`SELECT * FROM metadata`)).rows;

    musicarr.map((m) => {
      m.metaData = metarr
        .filter((meta) => meta.music_id === m.id)
        .map((obj) => ({ key: obj.key, value: obj.value }));
    });

    return musicarr;
  } catch (error) {
    console.log(error);
  }
};

const MusicWithId = async (args) => {
  const ID = args.musicId || args;
  try {
    let music = (await pool.query(`SELECT * FROM music WHERE id = $1 `, [ID]))
      .rows[0];
    if (!music) {
      throw new Error("No Music Found");
    }
    let metaData = (
      await pool.query(`SELECT key,value FROM metadata WHERE music_id = $1`, [
        ID,
      ])
    ).rows;
    music.metaData = metaData;
    return music;
  } catch (error) {
    console.log(error.message);
  }
};

const Addmusic = async (args) => {
  try {
    const music = {
      id: args.MusicInput.id,
      title: args.MusicInput.title,
      album: args.MusicInput.album,
      artist: args.MusicInput.artist,
      year: args.MusicInput.year,
      metaData: args.MusicInput.metaData,
    };
    // musics.push(music);
    // console.log(music);
    let result = (
      await pool.query(`SELECT id FROM music WHERE id = $1`, [music.id])
    ).rows;
    if (result.length === 1) {
      throw new Error("Music Record Already Present");
    }
    let results = (
      await pool.query(
        `INSERT INTO music(id,title,album,artist,year)
            VALUES($1,$2,$3,$4,$5) RETURNING id,title,album,artist,year`,
        [music.id, music.title, music.album, music.artist, music.year]
      )
    ).rows;
    if (results.length === 0) {
      throw new Error("Insertion failed");
    }
    for (let i = 0; i < music.metaData.length; i++) {
      await pool.query(
        `INSERT INTO metadata(key,value,music_id) VALUES($1,$2,$3)`,
        [music.metaData[i].key, music.metaData[i].value, music.id]
      );
    }

    return Allmusic();
  } catch (error) {
    if (error) {
      console.log(error.message);
      return Allmusic();
    }
  }
};

const DeleteMusic = async (args) => {
  //   const element = musics.find((music) => {
  //     music.id === args.musicId;
  //   });
  //   let index = musics.indexOf(element);
  //   musics.splice(index, 1);
  //   return musics;
  try {
    const ID = args.musicId;

    let result = (await pool.query(`SELECT id FROM music WHERE id = $1`, [ID]))
      .rows;
    if (result.length !== 1) {
      throw new Error("Music Record Not Found");
    }
    await pool.query(`DELETE FROM music WHERE id = $1`, [ID]);
    await pool.query(`DELETE FROM metadata where music_id = $1`, [ID]);

    return Allmusic();
  } catch (err) {
    console.log(err);
  }
};

const TitleUpdate = async (args) => {
  //   const music = musics.find((m) => m.id === args.musicId);
  //   music.title = args.title;
  //   return music;
  try {
    const ID = args.musicId;
    const newTitle = args.title;
    let result = (await pool.query(`SELECT id FROM music WHERE id = $1`, [ID]))
      .rows;
    if (result.length !== 1) {
      throw new Error("Music Record Not Found");
    }
    await pool.query(`UPDATE music SET title = $1 WHERE id = $2`, [
      newTitle,
      ID,
    ]);
    return MusicWithId(ID);
  } catch (err) {
    console.log(err.message);
  }
};

const ArtistUpdate = async (args) => {
  // {
  //     const music = musics.find((m) => m.id === args.musicId);
  //     music.artist = args.artist;
  //     return music;
  //   }
  try {
    const ID = args.musicId;
    const newArtist = args.artist;
    let result = (await pool.query(`SELECT id FROM music WHERE id = $1`, [ID]))
      .rows;
    if (result.length !== 1) {
      throw new Error("Music Record Not Found");
    }
    await pool.query(`UPDATE music SET artist = $1 WHERE id = $2`, [
      newArtist,
      ID,
    ]);
    return MusicWithId(ID);
  } catch (err) {
    console.log(err.message);
  }
};

const YearUpdate = async (args) => {
  // {
  //     const music = musics.find((m) => m.id === args.musicId);
  //     music.artist = args.artist;
  //     return music;
  //   }
  try {
    const ID = args.musicId;
    const newYear = args.year;
    let result = (await pool.query(`SELECT id FROM music WHERE id = $1`, [ID]))
      .rows;
    if (result.length !== 1) {
      throw new Error("Music Record Not Found");
    }
    await pool.query(`UPDATE music SET year = $1 WHERE id = $2`, [newYear, ID]);
    return MusicWithId(ID);
  } catch (err) {
    console.log(err.message);
  }
};
const Add_meta = async (args) => {
  try {
    // const meta = {
    //     key: args.key,
    //     value: args.value,
    // };
    // const music = musics.find((m) => m.id === args.musicId);
    // music.metaData.push(meta);
    // console.log(music);
    // return music;
    const ID = args.musicId;
    const key = args.key;
    const value = args.value;
    let result = (await pool.query(`SELECT id FROM music WHERE id = $1`, [ID]))
      .rows;
    if (result.length !== 1) {
      throw new Error("Music Record Not Found");
    }

    await pool.query(
      `INSERT INTO metadata(key,value,music_id) VALUES ($1,$2,$3)`,
      [key, value, ID]
    );

    return MusicWithId(ID);
  } catch (err) {
    console.log(err.message);
  }
};
const Remove_meta = async (args) => {
  try {
    // const music = musics.find((m) => m.id === args.musicId);
    //   const meta = music.metaData;
    //   meta.forEach((ele, i) => {
    //     if (ele.key === args.key) {
    //       meta.splice(i, 1);
    //     }
    //   });
    //   return music;

    const ID = args.musicId;
    const delKey = args.key;
    let result = (await pool.query(`SELECT id FROM music WHERE id = $1`, [ID]))
      .rows;
    if (result.length !== 1) {
      throw new Error("Music Record Not Found");
    }
    await pool.query(`DELETE FROM metadata where music_id = $1 AND key = $2`, [
      ID,
      delKey,
    ]);
    return MusicWithId(ID);
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  musics: () => Allmusic(),
  music: (args) => MusicWithId(args),
  addMusic: (args) => Addmusic(args),
  delMusic: (args) => DeleteMusic(args),
  updateTitle: (args) => TitleUpdate(args),
  updateArtist: (args) => ArtistUpdate(args),
  updateYear: (args) => YearUpdate(args),
  addMeta: (args) => Add_meta(args),
  rmMeta: (args) => Remove_meta(args),
};
