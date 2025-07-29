const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const threadId = localStorage.getItem('threadId') || null;

async function sendMessage(message) {
  appendMessage('user', message);

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, threadId })
  });

  const data = await response.json();
  if (data.reply) appendMessage('assistant', data.reply);
  if (data.threadId) localStorage.setItem('threadId', data.threadId);
}

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = sender === 'user' ? 'user-msg' : 'assistant-msg';
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message) {
    sendMessage(message);
    userInput.value = '';
  }
});