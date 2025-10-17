// --- PIN unlock logic ---
const correctPin = "9020";

document.getElementById("unlock-btn").addEventListener("click", () => {
  const entered = document.getElementById("pin").value.trim();
  const errorMsg = document.getElementById("error-msg");
  if (entered === correctPin) {
    document.getElementById("lock-section").style.display = "none";
    document.getElementById("form-section").style.display = "block";
  } else {
    errorMsg.textContent = "गलत पिन! कृपया पुनः प्रयास करें।";
    errorMsg.style.color = "red";
  }
});

// --- Form submission logic ---
document.getElementById("submit-btn").addEventListener("click", async () => {
  const status = document.getElementById("status");
  status.textContent = "⏳ Processing...";

  const repo = "deeputsavrmlauexamsin/deeputsavrmlauexamsin.github.io";
  const token = document.getElementById("token").value.trim();

  // Read image as base64
  const file = document.getElementById("photo").files[0];
  let photo_data_url = "";
  if (file) {
    const reader = new FileReader();
    reader.onloadend = async () => {
      photo_data_url = reader.result;
      await sendToGitHub(photo_data_url);
    };
    reader.readAsDataURL(file);
  } else {
    await sendToGitHub("");
  }

  async function sendToGitHub(photo_data_url) {
    const payload = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      card_number: document.getElementById("card_number").value,
      ghat: document.getElementById("ghat").value,
      role: document.getElementById("role").value,
      college: document.getElementById("college").value,
      photo_data_url: photo_data_url
    };

    const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github.everest-preview+json",
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event_type: "update_user",
        client_payload: payload
      })
    });

    if (res.ok) {
      status.textContent = "✅ सफलतापूर्वक अपडेट हो गया!";
      status.style.color = "green";
    } else {
      const err = await res.text();
      status.textContent = `❌ Error: ${res.status} — ${err}`;
      status.style.color = "red";
    }
  }
});
