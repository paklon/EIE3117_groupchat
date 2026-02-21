// public/js/main.js
async function refreshChat(groupId) {
  try {
    const res = await fetch(`/groups/${groupId}/refresh`);
    if (!res.ok) return;
    const data = await res.json();
    const container = document.getElementById('message-list');
    if (!container) return;
    container.innerHTML = '';
    data.messages.forEach((m) => {
      const div = document.createElement('div');
      div.className = 'mb-2';
      div.innerHTML =
        `<strong>${m.sender}</strong> ` +
        `<small>${new Date(m.createdAt).toLocaleString()}</small><br>` +
        (m.text ? `${m.text}<br>` : '') +
        (m.imagePath ? `<img src="${m.imagePath}" style="max-width:200px;"><br>` : '');
      container.appendChild(div);
    });
  } catch (e) {
    console.error(e);
  }
}
