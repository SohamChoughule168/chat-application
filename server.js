const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

app.use(express.static(path.join(__dirname, "public")))

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

const users = new Map()
const rooms = new Set(["General", "Technology", "Random"])

io.on("connection", (socket) => {
  console.log("New user connected")

  socket.on("join", ({ username, room }) => {
    if (Array.from(users.values()).includes(username)) {
      socket.emit("username taken")
      return
    }

    users.set(socket.id, username)
    socket.join(room)

    socket.emit("room joined", { room, username })
    socket.to(room).emit("user joined", { username })

    io.to(room).emit("room users", {
      room,
      users: Array.from(io.sockets.adapter.rooms.get(room) || []).map((id) => users.get(id)),
    })
  })

  socket.on("chat message", ({ room, message }) => {
    const username = users.get(socket.id)
    io.to(room).emit("chat message", {
      username,
      message,
      timestamp: new Date().toISOString(),
    })
  })

  socket.on("create room", (room) => {
    if (!rooms.has(room)) {
      rooms.add(room)
      io.emit("room list", Array.from(rooms))
    }
  })

  socket.on("disconnect", () => {
    const username = users.get(socket.id)
    users.delete(socket.id)
    io.emit("user left", { username })
  })

  socket.emit("room list", Array.from(rooms))
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

