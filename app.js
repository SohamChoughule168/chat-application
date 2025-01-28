const socket = io()

const loginContainer = document.getElementById("login-container")
const chatContainer = document.getElementById("chat-container")
const usernameInput = document.getElementById("username")
const roomSelect = document.getElementById("room-select")
const newRoomInput = document.getElementById("new-room")
const joinBtn = document.getElementById("join-btn")
const roomName = document.getElementById("room-name")
const userList = document.getElementById("user-list")
const chatMessages = document.getElementById("chat-messages")
const chatForm = document.getElementById("chat-form")
const chatInput = document.getElementById("chat-input")

let currentRoom = ""

socket.on("room list", (rooms) => {
  roomSelect.innerHTML = '<option value="">Select a room</option>'
  rooms.forEach((room) => {
    const option = document.createElement("option")
    option.value = room
    option.textContent = room
    roomSelect.appendChild(option)
  })
})

joinBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim()
  const room = roomSelect.value || newRoomInput.value.trim()

  if (!username || !room) {
    alert("Please enter a username and select or create a room")
    return
  }

  socket.emit("join", { username, room })
})

socket.on("username taken", () => {
  alert("Username is already taken. Please choose another one.")
})

socket.on("room joined", ({ room, username }) => {
  loginContainer.style.display = "none"
  chatContainer.style.display = "block"
  roomName.textContent = `Room: ${room}`
  currentRoom = room
})

socket.on("user joined", ({ username }) => {
  const message = document.createElement("div")
  message.classList.add("message")
  message.innerHTML = `<span class="username">${username}</span> has joined the room`
  chatMessages.appendChild(message)
})

socket.on("room users", ({ room, users }) => {
  userList.innerHTML = ""
  users.forEach((user) => {
    const li = document.createElement("li")
    li.textContent = user
    userList.appendChild(li)
  })
})

chatForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const message = chatInput.value.trim()
  if (message) {
    socket.emit("chat message", { room: currentRoom, message })
    chatInput.value = ""
  }
})

socket.on("chat message", ({ username, message, timestamp }) => {
  const messageElement = document.createElement("div")
  messageElement.classList.add("message")
  messageElement.innerHTML = `
        <span class="username">${username}</span>
        <span class="timestamp">${new Date(timestamp).toLocaleTimeString()}</span>
        <p>${formatMessage(message)}</p>
    `
  chatMessages.appendChild(messageElement)
  chatMessages.scrollTop = chatMessages.scrollHeight
})

socket.on("user left", ({ username }) => {
  const message = document.createElement("div")
  message.classList.add("message")
  message.innerHTML = `<span class="username">${username}</span> has left the room`
  chatMessages.appendChild(message)
})

function formatMessage(message) {
  return message
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
}

newRoomInput.addEventListener("input", () => {
  if (newRoomInput.value) {
    roomSelect.value = ""
  }
})

roomSelect.addEventListener("change", () => {
  if (roomSelect.value) {
    newRoomInput.value = ""
  }
})

