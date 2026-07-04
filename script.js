const search = document.querySelector("#search");
const cards = [...document.querySelectorAll(".searchable")];
const result = document.querySelector("#search-result");
const filters = [...document.querySelectorAll(".filter")];
const themeToggle = document.querySelector(".theme-toggle");
const walletButtons = [
  document.querySelector("#wallet-button"),
  document.querySelector("#wallet-card-button"),
].filter(Boolean);
const walletStatus = document.querySelector("#wallet-status");
const walletAddress = document.querySelector("#wallet-address");
const walletNetwork = document.querySelector("#wallet-network");
const copyAddress = document.querySelector("#copy-address");
const disconnectWallet = document.querySelector("#disconnect-wallet");

let selectedCategory = "all";
let connectedAddress = "";

const chainNames = {
  "0x1": "Ethereum Mainnet",
  "0xaa36a7": "Sepolia Testnet",
  "0x89": "Polygon",
  "0x2105": "Base",
  "0xa": "Optimism",
  "0xa4b1": "Arbitrum One",
};

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function updateCards() {
  const term = search.value.trim().toLowerCase();
  let matches = 0;

  cards.forEach((card) => {
    const matchesSearch = !term || card.dataset.search.toLowerCase().includes(term);
    const matchesCategory =
      selectedCategory === "all" ||
      card.dataset.category === selectedCategory ||
      !card.dataset.category;
    const visible = matchesSearch && matchesCategory;

    card.classList.toggle("hidden", !visible);
    if (visible && card.dataset.category) matches += 1;
  });

  result.textContent = term ? `找到 ${matches} 篇相关笔记` : "";
}

function setWalletDisconnected(message = "安装 MetaMask 或其他兼容 EVM 的钱包后即可体验。") {
  connectedAddress = "";
  walletStatus.textContent = "未连接";
  walletStatus.className = "wallet-status offline";
  walletAddress.textContent = "尚未连接钱包";
  walletNetwork.textContent = message;
  walletButtons.forEach((button) => {
    button.textContent = "连接钱包";
    button.disabled = false;
  });
  copyAddress.disabled = true;
  disconnectWallet.disabled = true;
  localStorage.removeItem("walletConnected");
}

async function setWalletConnected(address) {
  connectedAddress = address;
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  const networkName = chainNames[chainId] || `未知网络 ${chainId}`;

  walletStatus.textContent = "已连接";
  walletStatus.className = "wallet-status online";
  walletAddress.textContent = shortAddress(address);
  walletNetwork.textContent = `当前网络：${networkName}`;
  walletButtons.forEach((button) => {
    button.textContent = shortAddress(address);
    button.disabled = false;
  });
  copyAddress.disabled = false;
  disconnectWallet.disabled = false;
  localStorage.setItem("walletConnected", "true");
}

async function connectWallet() {
  if (!window.ethereum) {
    setWalletDisconnected("没有检测到钱包。请先安装 MetaMask，或在钱包 App 的内置浏览器中打开本站。");
    return;
  }

  walletButtons.forEach((button) => {
    button.textContent = "连接中...";
    button.disabled = true;
  });

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (accounts.length) {
      await setWalletConnected(accounts[0]);
    } else {
      setWalletDisconnected("钱包没有返回可用账户。");
    }
  } catch (error) {
    setWalletDisconnected(error?.message || "连接钱包失败，请稍后再试。");
  }
}

async function restoreWalletIfAllowed() {
  if (!window.ethereum || localStorage.getItem("walletConnected") !== "true") return;
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  if (accounts.length) await setWalletConnected(accounts[0]);
}

search.addEventListener("input", updateCards);

filters.forEach((button) =>
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle("active", item === button));
    updateCards();
  }),
);

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    search.focus();
  }
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

walletButtons.forEach((button) => button.addEventListener("click", connectWallet));

copyAddress.addEventListener("click", async () => {
  if (!connectedAddress) return;
  await navigator.clipboard.writeText(connectedAddress);
  copyAddress.textContent = "已复制";
  window.setTimeout(() => {
    copyAddress.textContent = "复制地址";
  }, 1200);
});

disconnectWallet.addEventListener("click", () => {
  setWalletDisconnected("已从本站断开显示。钱包本身仍然安全保存在你的浏览器/钱包 App 中。");
});

if (window.ethereum) {
  window.ethereum.on?.("accountsChanged", (accounts) => {
    if (accounts.length) setWalletConnected(accounts[0]);
    else setWalletDisconnected("钱包账户已断开。");
  });

  window.ethereum.on?.("chainChanged", () => {
    if (connectedAddress) setWalletConnected(connectedAddress);
  });
}

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

restoreWalletIfAllowed();
