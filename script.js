const gifts = [
  "Một cây kẹo mút cầu vồng",
  "Một vé đi xem film cùng anh Hiếu",
  "Một gấu bông",
  "Chúc bé may mắn lần sau",
  "Một chiếc bóng bay màu hồng",
  "Một phần bánh ngọt nhỏ xinh",
  "Một vé đi xem film cùng anh Hiếu",
  "Một thỏi son",
  "Một chiếc váy mới",
  "Một vé đi xem film cùng anh Hiếu",

];

const STORE_KEY = "child_day_gift_picked_v2";
const EXTRA_KEY = "child_day_extra_turn_v2";
const UNLOCK_USED_KEY = "child_day_unlock_used_v1";
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

function hasPicked() {
  return localStorage.getItem(STORE_KEY) === "yes";
}

function hasExtraTurn() {
  return localStorage.getItem(EXTRA_KEY) === "yes";
}

function hasUsedExtraUnlock() {
  return localStorage.getItem(UNLOCK_USED_KEY) === "yes";
}

function setExtraUnlockUsed() {
  localStorage.setItem(UNLOCK_USED_KEY, "yes");
}

function setPicked() {
  localStorage.setItem(STORE_KEY, "yes");
  localStorage.removeItem(EXTRA_KEY);
}

function unlockTurn(message) {
  if (hasUsedExtraUnlock()) {
    unlockMsg.textContent = "Bé đã dùng quyền xin thêm lượt rồi, không mở thêm được nữa nha.";
    return;
  }

  setExtraUnlockUsed();
  localStorage.setItem(EXTRA_KEY, "yes");
  unlockMsg.textContent = message;
  result.innerHTML = "<p>Bé đã có thêm 1 lượt. Chọn hộp quà đi nào!</p>";
  updateState();
}

function canPlay() {
  return !hasPicked() || hasExtraTurn();
}

function updateState() {
  const playable = canPlay();
  const unlockUsed = hasUsedExtraUnlock();
  boxes.forEach(box => box.disabled = !playable);
  if (passInput) passInput.disabled = unlockUsed;
  if (passBtn) passBtn.disabled = unlockUsed;
  if (riddleInput) riddleInput.disabled = unlockUsed;
  if (riddleBtn) riddleBtn.disabled = unlockUsed;

  if (playable && !hasPicked()) {
    turnText.textContent = "Bé còn 1 lượt bốc quà.";
  } else if (playable && hasExtraTurn()) {
    turnText.textContent = "Bé có thêm 1 lượt đặc biệt.";
  } else {
    if (hasUsedExtraUnlock()) {
      turnText.textContent = "Bé đã dùng hết lượt và quyền xin thêm lượt trên thiết bị này.";
    } else {
      turnText.textContent = "Bé đã bốc quà rồi. Muốn thêm lượt thì ib anh Hiếu hoặc giải đố nhé.";
    }
  }
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

  result.innerHTML = `
    <p>
      Chúc mừng bé nhận được:<br>
      <strong>${gift}</strong><br>
      <small>Hộp số ${Number(boxId) + 1}</small>
    </p>
  `;
  createConfetti();
  updateState();
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
  if (hasUsedExtraUnlock()) {
    unlockMsg.textContent = "Bé đã dùng quyền xin thêm lượt rồi, không nhập mật mã thêm được nữa nha.";
    return;
  }
  const ok = await isHashMatch(passInput.value, [SECRET_CODE_HASH]);
  if (ok) {
    unlockTurn("Đúng mật mã rồi! Anh Hiếu cho bé thêm 1 lượt.");
    passInput.value = "";
  } else {
    unlockMsg.textContent = "Mật mã chưa đúng. Bé thử hỏi anh Hiếu nha.";
  }
});

riddleBtn.addEventListener("click", async () => {
  if (hasUsedExtraUnlock()) {
    unlockMsg.textContent = "Bé đã dùng quyền giải đố xin thêm lượt rồi, không mở thêm lần nữa nha.";
    return;
  }
  const ok = await isHashMatch(riddleInput.value, RIDDLE_ANSWER_HASHES);
  if (ok) {
    unlockTurn("Giỏi quá! Đáp án đúng, bé nhận thêm 1 lượt.");
    riddleInput.value = "";
  } else {
    unlockMsg.textContent = "Chưa đúng rồi. Gợi ý: món này ngọt và nhiều màu.";
  }
});

updateState();
