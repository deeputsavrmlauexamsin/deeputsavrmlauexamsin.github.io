document.addEventListener("DOMContentLoaded", () => {
  const correctPin = "9020";
  const unlockBtn = document.getElementById("unlock-btn");
  const pinInput = document.getElementById("pin");
  const lockSection = document.getElementById("lock-section");
  const formSection = document.getElementById("form-section");
  const errorMsg = document.getElementById("error-msg");
  const submitBtn = document.getElementById("submit-btn");
  const statusMsg = document.getElementById("status");

  // Unlock section logic
  unlockBtn.addEventListener("click", () => {
    if (pinInput.value.trim() === correctPin) {
      lockSection.style.display = "none";
      formSection.style.display = "block";
      errorMsg.textContent = "";
    } else {
      errorMsg.textContent = "❌ गलत PIN! कृपया पुनः प्रयास करें।";
    }
  });

  // Function to upload a file to GitHub
  async function uploadToGitHub(token, repo, path, fileContent, message) {
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
    const getRes = await fetch(apiUrl, {
      headers: { Authorization: `token ${token}` }
    });

    let sha = null;
    if (getRes.ok) {
      const json = await getRes.json();
      sha = json.sha;
    }

    const body = {
      message: message,
      content: btoa(fileContent),
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!putRes.ok) throw new Error("Failed to upload to GitHub");
    return await putRes.json();
  }

  // Submit form handler
  submitBtn.addEventListener("click", async () => {
    try {
      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const card_number = document.getElementById("card_number").value.trim();
      const ghat = document.getElementById("ghat").value.trim();
      const role = document.getElementById("role").value.trim();
      const college = document.getElementById("college").value.trim();
      const token = document.getElementById("token").value.trim();
      const photoFile = document.getElementById("photo").files[0];

      if (!token) return alert("❗ कृपया GitHub Token दर्ज करें।");
      if (!name || !phone || !ghat) return alert("कृपया सभी आवश्यक जानकारी भरें।");

      statusMsg.textContent = "📤 Uploading photo...";

      // 1️⃣ Upload photo first
      let photoFileName = "";
      if (photoFile) {
        const reader = new FileReader();
        const fileBuffer = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(photoFile);
        });
        const base64Data = fileBuffer.split(",")[1];
        const fileBytes = atob(base64Data);
        const byteArray = new Uint8Array(fileBytes.length);
        for (let i = 0; i < fileBytes.length; i++) {
          byteArray[i] = fileBytes.charCodeAt(i);
        }

        const repo = "deeputsavrmlauexamsin/deeputsavrmlauexamsin.github.io";
        const filePath = `Department/Print_Data/photos/${Date.now()}_${photoFile.name}`;
        await uploadToGitHub(
          token,
          repo,
          filePath,
          base64Data,
          `Upload photo for ${name}`
        );
        photoFileName = filePath.split("/").pop();
      }

      statusMsg.textContent = "✅ Photo uploaded. Creating dispatch event...";

      // 2️⃣ Send metadata (no big base64)
      const payload = {
        event_type: "update_user",
        client_payload: {
          name,
          phone,
          card_number,
          ghat,
          role,
          college,
          photo_filename: photoFileName
        }
      };

      const dispatchRes = await fetch(
        "https://api.github.com/repos/deeputsavrmlauexamsin/deeputsavrmlauexamsin.github.io/dispatches",
        {
          method: "POST",
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.everest-preview+json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      if (!dispatchRes.ok) {
        const err = await dispatchRes.text();
        throw new Error("Dispatch failed: " + err);
      }

      statusMsg.textContent = "🎉 Successfully sent to GitHub Action! It will appear live soon.";
      alert("✅ उपयोगकर्ता विवरण GitHub पर भेज दिया गया है। कुछ मिनट में अपडेट दिखाई देगा।");
    } catch (err) {
      console.error(err);
      statusMsg.textContent = "❌ Error: " + err.message;
      alert("Error: " + err.message);
    }
  });
});
