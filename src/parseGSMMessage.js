// GSM 7-bit base table (no escapes)
const GSM7_BASIC = new Set([
  '@',
  '£',
  '$',
  '¥',
  'è',
  'é',
  'ù',
  'ì',
  'ò',
  'Ç',
  '\n',
  'Ø',
  'ø',
  '\r',
  'Å',
  'å',
  'Δ',
  '_',
  'Φ',
  'Γ',
  'Λ',
  'Ω',
  'Π',
  'Ψ',
  'Σ',
  'Θ',
  'Ξ',
  'Æ',
  'æ',
  'ß',
  'É',
  ' ',
  '!',
  '"',
  '#',
  '¤',
  '%',
  '&',
  "'",
  '(',
  ')',
  '*',
  '+',
  ',',
  '-',
  '.',
  '/',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  ':',
  ';',
  '<',
  '=',
  '>',
  '?',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
]);

// GSM 7-bit extended (escape table)
const GSM7_EXT = new Set(['^', '{', '}', '\\', '[', '~', ']', '|', '€']);

export function isGsm7(message) {
  for (const ch of message) {
    if (GSM7_BASIC.has(ch)) continue;
    if (GSM7_EXT.has(ch)) continue;
    return false; // illegal for GSM-7 → must use UCS2
  }
  return true;
}

export default function (message) {
  const messageSize = isGsm7(message) ? 160 : 70;
  const words = message.split(' ').filter(Boolean);

  const messageParts = [];
  let messageBuffer = '';
  for (const word of words) {
    if (messageBuffer.length + word.length + 1 <= messageSize) {
      messageBuffer += (messageBuffer.length > 0 ? ' ' : '') + word;
    } else {
      messageParts.push(messageBuffer);
      messageBuffer = word;
    }
  }

  if (messageBuffer.length > 0) {
    messageParts.push(messageBuffer);
  }

  return messageParts;
}
