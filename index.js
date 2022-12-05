const https = require("https");
const express = require("express");

const PORT = process.env.PORT || 3000;
const INDEX = "/index.html";

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const { clearInterval } = require("timers");
const io = require("socket.io")(server);

let connections = 0;
let loop = null;

const getRandomUser = () =>
  new Promise((resolve, reject) => {
    https
      .get("https://randomuser.me/api/", (resp) => {
        let data = "";
        resp.on("data", (chunk) => {
          data += chunk;
        });

        resp.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(err.message);
      });
  });

io.on("connection", async (socket) => {
  connections++;
  if (loop === null) {
    loop = setInterval(async () => {
      try {
        const user = await getRandomUser();

        io.emit("userList", JSON.parse(user));
      } catch (e) {
        console.log(e);
      }
    }, 5000);
  }
  socket.on("disconnect", () => {
    console.log("user disconnected");
    
    if(--connections === 0) {
      clearInterval(loop);
      loop = null;
      console.log("last user disconnected");
    }
  });
});
