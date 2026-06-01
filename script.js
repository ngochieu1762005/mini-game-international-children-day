const gifts = [
  "Một cây kẹo mút cầu vồng",
  "Một sticker siêu cute",
  "Một gấu bông mini",
  "Một vé được ôm thật lâu",
  "Một chiếc bóng bay màu hồng",
  "Một phần bánh ngọt nhỏ xinh",
  "Một lời khen: Bé hôm nay đáng yêu quá!",
  "Một điều ước bí mật",
  "Một hộp sữa nhỏ",
  "Một phần snack yêu thích"
];

const STORE_KEY = "child_day_gift_picked_v2";
const EXTRA_KEY = "child_day_extra_turn_v2";
const GIFT_LOG_KEY = "child_day_gift_results_json_v1";
// Không để đáp án dạng chữ thường trong code.
// Web sẽ băm SHA-256 câu trả lời người chơi rồi so với các hash bên dưới.
// Lưu ý: web tĩnh chỉ che được khỏi việc nhìn thấy đáp án trực tiếp trong F12,
// không bảo mật tuyệt đối như backend.
const SECRET_CODE_HASH = "d997cf496d676acea4bf02b98903662bf5b2f9620b6e05052694c7a7cdffbd29";
const RIDDLE_ANSWER_HASHES = [
  "3c4560ff8f11ebd2149b9cc8c0582eb208ca95f50dd1beaa47af487fc5712baa",
  "4d1608c849f1a4968565d5019e500b9c3541f654c33ac9d096b610d27229499c",
  "9ae28042ac17161243a6957e3b4b603eb6f85de2c650765156c119e1c17d71fa"
];

const boxes = document.querySelectorAll(".box");
const result = document.getElementById("result");
const turnText = document.getElementById("turnText");
const passInput = document.getElementById("passInput");
const passBtn = document.getElementById("passBtn");
const riddleInput = document.getElementById("riddleInput");
const riddleBtn = document.getElementById("riddleBtn");
const unlockMsg = document.getElementById("unlockMsg");
const giftLogList = document.getElementById("giftLogList");
const downloadJsonBtn = document.getElementById("downloadJsonBtn");

function hasPicked() {
  return localStorage.getItem(STORE_KEY) === "yes";
}

function hasExtraTurn() {
  return localStorage.getItem(EXTRA_KEY) === "yes";
}

function setPicked() {
  localStorage.setItem(STORE_KEY, "yes");
  localStorage.removeItem(EXTRA_KEY);
}

function unlockTurn(message) {
  localStorage.setItem(EXTRA_KEY, "yes");
  unlockMsg.textContent = message;
  result.innerHTML = "<p>Bé đã có thêm 1 lượt. Chọn hộp quà đi nào!</p>";
  if (downloadJsonBtn) {
  downloadJsonBtn.addEventListener("click", downloadGiftJson);
}

updateState();
renderGiftLogs();
}

function canPlay() {
  return !hasPicked() || hasExtraTurn();
}

function updateState() {
  const playable = canPlay();
  boxes.forEach(box => box.disabled = !playable);

  if (playable && !hasPicked()) {
    turnText.textContent = "Bé còn 1 lượt bốc quà.";
  } else if (playable && hasExtraTurn()) {
    turnText.textContent = "Bé có thêm 1 lượt đặc biệt.";
  } else {
    turnText.textContent = "Bé đã bốc quà rồi. Muốn thêm lượt thì ib anh Hiếu hoặc giải đố nhé.";
  }
}


function getGiftLogs() {
  const raw = localStorage.getItem(GIFT_LOG_KEY);
  if (!raw) return [];
  try {
    const logs = JSON.parse(raw);
    return Array.isArray(logs) ? logs : [];
  } catch (error) {
    return [];
  }
}

function saveGiftLog(boxId, gift) {
  const logs = getGiftLogs();
  const childNameInput = document.getElementById("wishName");
  const childName = childNameInput && childNameInput.value.trim()
    ? childNameInput.value.trim()
    : "Bé chưa nhập tên";

  const record = {
    id: `gift-${Date.now()}`,
    childName,
    boxNumber: Number(boxId) + 1,
    giftName: gift,
    pickedAt: new Date().toISOString(),
    pickedAtText: new Date().toLocaleString("vi-VN")
  };

  logs.push(record);
  localStorage.setItem(GIFT_LOG_KEY, JSON.stringify(logs, null, 2));
  renderGiftLogs();
  downloadGiftJson();
  return record;
}

function renderGiftLogs() {
  if (!giftLogList) return;
  const logs = getGiftLogs();

  if (!logs.length) {
    giftLogList.innerHTML = '<p class="empty-log">Chưa có bé nào bốc quà trong trình duyệt này.</p>';
    return;
  }

  giftLogList.innerHTML = logs.slice().reverse().map(item => `
    <div class="gift-log-item">
      <span class="gift-log-box">Hộp ${item.boxNumber}</span>
      <div>
        <strong>${escapeHtml(item.giftName)}</strong>
        <p>${escapeHtml(item.childName)} • ${escapeHtml(item.pickedAtText)}</p>
      </div>
    </div>
  `).join("");
}

function downloadGiftJson() {
  const logs = getGiftLogs();
  const data = {
    website: "Mini game Quốc tế Thiếu nhi 1/6",
    exportedAt: new Date().toISOString(),
    total: logs.length,
    results: logs
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "gift-results.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function pickGift(box) {
  if (!canPlay()) {
    result.innerHTML = "<p>Bé đã hết lượt rồi. Hãy nhập mật mã hoặc giải câu đố để chơi tiếp nhé!</p>";
    return;
  }

  const gift = gifts[Math.floor(Math.random() * gifts.length)];
  const boxId = box.dataset.id || "0";
  boxes.forEach(item => {
    item.classList.remove("opened");
    item.innerHTML = `<span></span><b>${Number(item.dataset.id) + 1}</b>`;
  });
  box.classList.add("opened");
  box.innerHTML = `<span></span><b>🎁</b><em>${gift}</em>`;
  setPicked();

  const savedRecord = saveGiftLog(boxId, gift);
  result.innerHTML = `
    <p>
      Chúc mừng bé nhận được:<br>
      <strong>${gift}</strong><br>
      <small>Đã lưu vào file <b>gift-results.json</b> • Hộp số ${savedRecord.boxNumber}</small>
    </p>
  `;
  createConfetti();
  if (downloadJsonBtn) {
  downloadJsonBtn.addEventListener("click", downloadGiftJson);
}

updateState();
renderGiftLogs();
}


function normalizeAnswer(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

async function sha256Text(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function isHashMatch(input, hashList) {
  const normalized = normalizeAnswer(input);
  if (!normalized) return false;
  const inputHash = await sha256Text(normalized);
  return hashList.includes(inputHash);
}

function createConfetti() {
  for (let i = 0; i < 42; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${50 + (Math.random() * 40 - 20)}%`;
    piece.style.top = "62%";
    piece.style.setProperty("--x", `${Math.random() * 360 - 180}px`);
    piece.style.setProperty("--y", `${Math.random() * -260 - 80}px`);
    piece.style.background = ["#ff7aaa", "#ffd56a", "#89e6ff", "#a8ef8f", "#c9a7ff"][Math.floor(Math.random() * 5)];
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 950);
  }
}

boxes.forEach(box => {
  box.addEventListener("click", () => pickGift(box));
});

passBtn.addEventListener("click", async () => {
  const ok = await isHashMatch(passInput.value, [SECRET_CODE_HASH]);
  if (ok) {
    unlockTurn("Đúng mật mã rồi! Anh Hiếu cho bé thêm 1 lượt.");
    passInput.value = "";
  } else {
    unlockMsg.textContent = "Mật mã chưa đúng. Bé thử hỏi anh Hiếu nha.";
  }
});

riddleBtn.addEventListener("click", async () => {
  const ok = await isHashMatch(riddleInput.value, RIDDLE_ANSWER_HASHES);
  if (ok) {
    unlockTurn("Giỏi quá! Đáp án đúng, bé nhận thêm 1 lượt.");
    riddleInput.value = "";
  } else {
    unlockMsg.textContent = "Chưa đúng rồi. Gợi ý: món này ngọt và nhiều màu.";
  }
});

if (downloadJsonBtn) {
  downloadJsonBtn.addEventListener("click", downloadGiftJson);
}

updateState();
renderGiftLogs();
