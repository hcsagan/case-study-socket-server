const https = require("https");
const httpServer = require("http").createServer();

const { clearInterval } = require("timers");
const io = require("socket.io")(httpServer, {});

httpServer.listen(3000);

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
