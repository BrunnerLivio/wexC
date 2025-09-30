// @ts-check
import { monkeyBall } from './monkeyball/monkeyball.js';
const socket = new WebSocket("ws://localhost:8081");


socket.onopen = () => {
  console.log("Connected to server");
  sendMessage("rotate_left", { angle: 15 });
};

socket.onmessage = (event) => {
  /**
   * @type {import('../../server/src/message.js').Message}
   */
  const data = JSON.parse(event.data);
  console.log(data);
};

/**
 *
 * @param {import('../../server/src/message.js').Action} action
 * @param {import('../../server/src/message.js').Message['payload']} payload
 */
const sendMessage = (action, payload = {}) => {
  socket.send(JSON.stringify({ action, payload }));
};


monkeyBall(document.getElementById('area'));