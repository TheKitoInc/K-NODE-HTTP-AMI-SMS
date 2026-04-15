import net from 'net';
import crypto from 'crypto';
import parseGSMMessage from './parseGSMMessage.js';

let socket = null;
let dataBuff = '';
const messages = [];
let lines = {};

function sendMessage(data) {
  let str = '';
  for (const key in data) {
    str += `${key}: ${data[key]}\r\n`;
  }
  str += '\r\n';

  socket.write(str);
}

function parseInput(chunk) {
  // Append data
  for (let i = 0; i < chunk.length; i++) {
    const ch = chunk[i];

    if (ch !== '\r') dataBuff += ch;

    if (ch === '\n') {
      // Full line available
      const line = dataBuff.trimEnd();
      dataBuff = '';

      if (line === '') {
        // End of message block
        messages.push(lines);
        lines = {};
      } else {
        const parts = line.split(':', 2);
        if (parts.length === 2) {
          const key = parts[0].trim().toLowerCase();
          const value = parts[1].trim().toLowerCase();
          lines[key] = value;
        }
      }
    }
  }
}

function waitResponse(key) {
  return new Promise(resolve => {
    const timeout = Date.now() + 30000;

    function check() {
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        for (const mKey in msg) {
          if (mKey === key.toLowerCase()) {
            messages.splice(i, 1);
            return resolve(msg);
          }
        }
      }

      if (Date.now() > timeout) {
        console.error('Wait response timeout:', key);
        return resolve(null);
      }

      setTimeout(check, 50);
    }

    check();
  });
}

function connect(host, port, username, secret) {
  return new Promise(resolve => {
    socket = net.createConnection({ host, port }, () => {
      sendMessage({
        action: 'login',
        username,
        secret,
      });
    });

    socket.on('data', chunk => parseInput(chunk.toString()));

    socket.on('error', err => {
      console.error('Socket error:', err);
      resolve(false);
    });

    socket.on('ready', async () => {
      const event = await waitResponse('response');
      console.log('Login response:', event);
      if (!event) return resolve(false);
      resolve(event['response'] === 'success');
    });
  });
}

async function sendSMS(channel, number, message) {
  for (const part of parseGSMMessage(message)) {
    console.log(`Sending to ${number} via channel ${channel}: ${part}`);
    if (!(await _sendSMS(channel, number, part))) return false;
  }

  return true;
}

async function _sendSMS(channel, number, message) {
  const id = Math.abs(crypto.randomBytes(4).readInt32LE());
  const flashSMS = 0;
  sendMessage({
    action: 'command',
    command: `gsm send sms ${channel} ${number} "${message}" ${flashSMS} ${id}`,
  });

  while (true) {
    const event = await waitResponse('span');

    if (!event) return false;

    const parts = (event['span'] ?? '').split(' ');

    if (!parts.includes(number)) continue;
    if (!parts.includes(String(channel))) continue;

    if (parts.includes('successfully')) return true;
  }
}

export async function connectAndSendSMS(HOST, PORT, USER, SECRET, channel, number, message) {
  const t0 = Date.now();

  const connected = await connect(HOST, PORT, USER, SECRET);
  const sent = connected ? await sendSMS(channel, number, message) : false;

  return {
    channel,
    number,
    message,
    connect: connected,
    sent: sent,
    time: (Date.now() - t0) / 1000,
  };
}

export default { connectAndSendSMS };
