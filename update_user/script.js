document.addEventListener("DOMContentLoaded", () => {
  const correctPin = "9020";
  const pinInput = document.getElementById("pin");
  const unlockBtn = document.getElementById("unlock-btn");
  const pinContainer = document.getElementById("pin-container");
  const formContainer = document.getElementById("form-container");
  const errorMsg = document.getElementById("error");

  unlockBtn.addEventListener("click", () => {
    const enteredPin = pinInput.value.trim();
    if (enteredPin === correctPin) {
      pinContainer.classList.add("hidden");
      formContainer.classList.remove("hidden");
      errorMsg.textContent = "";
    } else {
      errorMsg.textContent = "❌ गलत PIN! कृपया पुनः प्रयास करें।";
    }
  });

  // form submission (placeholder)
  document.getElementById("submit-btn").addEventListener("click", async () => {
    const token = document.getElementById("token").value.trim();
    if (!token) {
      alert("Please enter your GitHub token before uploading.");
      return;
    }
    document.getElementById("status").textContent = "⏳ Uploading data...";
    alert("Form submission logic will go here next (GitHub upload).");
  });
});
