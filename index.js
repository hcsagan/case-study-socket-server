const https = require("https");
const express = require("express");

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));


const { clearInterval } = require("timers");
const io = require("socket.io")(server);

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
        reject(data.message);
      });
  });

io.on("connection", async (socket) => {
  const loop = setInterval(async () => {
    try {
      const user = await getRandomUser();

      socket.emit("userList", JSON.parse(user));
    } catch (e) {
      console.log(e);
    }
  }, 5000);

  socket.on("disconnect", () => {
    clearInterval(loop);
    console.log("user disconnected");
  });
});
