document.addEventListener("DOMContentLoaded", () => {
  const PAGE_PIN = "9020";
  const REPO_OWNER = "deeputsavrmlauexamsin";
  const REPO_NAME = "deeputsavrmlauexamsin.github.io";
  const DISPATCH_EVENT = "update_user";
  const BASE_CARD_URL = `https://${REPO_OWNER}.github.io/Department/Print_Data/?ID=`;

  const $ = id => document.getElementById(id);
  const setStatus = msg => $("status").innerHTML = msg;

  // Unlock logic
  $("unlock-btn").addEventListener("click", () => {
    const pin = $("pin-input").value.trim();
    if (pin === PAGE_PIN) {
      $("pin-screen").classList.add("hidden");
      $("main-form").classList.remove("hidden");
      const saved = localStorage.getItem("gh_token_admin");
      if (saved) $("gh-token").value = saved;
    } else {
      alert("❌ गलत PIN / Wrong PIN");
    }
  });

  $("save-token-btn").addEventListener("click", () => {
    const t = $("gh-token").value.trim();
    if (!t) return alert("Paste token first!");
    localStorage.setItem("gh_token_admin", t);
    alert("Token saved locally!");
  });

  $("clear-token-btn").addEventListener("click", () => {
    localStorage.removeItem("gh_token_admin");
    $("gh-token").value = "";
    alert("Token cleared!");
  });

  // Utility: convert file → dataURL
  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  function randomSlug(len=6) {
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    let s = "";
    arr.forEach(b => s += String.fromCharCode(65 + (b % 25)));
    return btoa(s).substring(0, len);
  }

  async function createQR(link) {
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(link)}`;
    const res = await fetch(qrURL);
    const blob = await res.blob();
    return await new Promise(r => {
      const fr = new FileReader();
      fr.onload = () => r(fr.result);
      fr.readAsDataURL(blob);
    });
  }

  async function sendDispatch(token, payload) {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": "token " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event_type: DISPATCH_EVENT,
        client_payload: payload
      })
    });
    if (!res.ok) throw new Error("Failed " + res.status);
  }

  $("user-form").addEventListener("submit", async e => {
    e.preventDefault();
    try {
      setStatus("Preparing data...");
      const token = $("gh-token").value.trim() || localStorage.getItem("gh_token_admin");
      if (!token) return alert("Please paste your GitHub token!");

      const name = $("name-en").value.trim();
      const mobile = $("mobile").value.trim();
      const cardNo = $("card-no").value.trim();
      const ghatNo = $("ghat-no").value.trim();
      const role = $("role-en").value.trim();
      const college = $("college-en").value.trim();
      const photo = $("photo-input").files[0];
      if (!photo) return alert("Upload a photo!");

      const photoData = await fileToDataURL(photo);
      const slug = randomSlug();
      const cardLink = BASE_CARD_URL + slug;
      const qrData = await createQR(cardLink);

      const payload = {
        name, phone: mobile, card_number: cardNo, ghat: ghatNo,
        role, college, photo_data_url: photoData, qr_data_url: qrData, slug
      };

      setStatus("Sending to GitHub...");
      await sendDispatch(token, payload);

      $("result-area").classList.remove("hidden");
      $("card-link").href = cardLink;
      $("card-link").textContent = cardLink;
      $("result-qr").src = qrData;
      setStatus("✅ Sent! Check your site in ~30s.");

    } catch (err) {
      console.error(err);
      alert(err.message);
      setStatus("❌ Error: " + err.message);
    }
  });
});
