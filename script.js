const STORAGE_KEY = "mapoo_history";
const MAPOO_VERSION = "0.1";

const urlInput = document.getElementById("url-input");
const convertBtn = document.getElementById("convertBtn");
const message = document.getElementById("message");
const apps = document.getElementById("apps");

const googleLink = document.getElementById("googleLink");
const wazeLink = document.getElementById("wazeLink");
const neshanLink = document.getElementById("neshanLink");
const baladLink = document.getElementById("baladLink");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

function resetOutputLinks() {
    apps.classList.remove("visible");

    const links = [googleLink, wazeLink, neshanLink, baladLink];

    links.forEach(link => {
        link.href = "#";
        link.classList.remove("active");
    });
}

function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = `message ${type}`;
}

function clearMessage() {
    message.textContent = "";
    message.className = "message";
}

function normalizeInput(value) {
    let input = value.trim();

    for (let i = 0; i < 3; i++) {
        try {
            const decoded = decodeURIComponent(input);

            if (decoded === input) {
                break;
            }

            input = decoded;
        } catch {
            break;
        }
    }

    return input;
}

function extractCoordinates(input) {
    const value = normalizeInput(input);

    const neshanHash = value.match(/#c(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)(?:-\d+(?:\.\d+)?z)?(?:-\d+p)?/i);

    if (neshanHash) {
        return {
            lat: Number(neshanHash[1]),
            lng: Number(neshanHash[2])
        };
    }

    const googleAt = value.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);

    if (googleAt) {
        return {
            lat: Number(googleAt[1]),
            lng: Number(googleAt[2])
        };
    }

    const googleQuery = value.match(/(?:[?&](?:q|query)=)(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);

    if (googleQuery) {
        return {
            lat: Number(googleQuery[1]),
            lng: Number(googleQuery[2])
        };
    }

    const waze = value.match(/(?:[?&]ll=)(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);

    if (waze) {
        return {
            lat: Number(waze[1]),
            lng: Number(waze[2])
        };
    }

    const latLng = value.match(/(?:[?&]|^)(?:lat(?:itude)?|y)=(-?\d+(?:\.\d+)?)[^#]*?(?:[?&]|&)(?:lng|lon|longitude|x)=(-?\d+(?:\.\d+)?)/i);

    if (latLng) {
        return {
            lat: Number(latLng[1]),
            lng: Number(latLng[2])
        };
    }

    const lngLat = value.match(/(?:[?&]|^)(?:lng|lon|longitude|x)=(-?\d+(?:\.\d+)?)[^#]*?(?:[?&]|&)(?:lat(?:itude)?|y)=(-?\d+(?:\.\d+)?)/i);

    if (lngLat) {
        return {
            lat: Number(lngLat[2]),
            lng: Number(lngLat[1])
        };
    }

    const balad = value.match(/[?&]latitude=(-?\d+(?:\.\d+))[^\s#]*?[?&]longitude=(-?\d+(?:\.\d+))/i);

    if (balad) {
        return {
            lat: Number(balad[1]),
            lng: Number(balad[2])
        };
    }

    const slashAt = value.match(/\/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);

    if (slashAt) {
        return {
            lat: Number(slashAt[1]),
            lng: Number(slashAt[2])
        };
    }

    const rawCoordinates = value.match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);

    if (rawCoordinates) {
        return {
            lat: Number(rawCoordinates[1]),
            lng: Number(rawCoordinates[2])
        };
    }

    return null;
}

function isValidCoordinates(lat, lng) {
    return (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
}

function createMapLinks(lat, lng) {
    return {
        google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,

        waze: `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`,

        neshan: `https://neshan.org/maps/share/${lat},${lng}`,

        balad: `https://balad.ir/location?latitude=${lat}&longitude=${lng}&zoom=16.5`
    };
}

function setOutputLinks(links) {
    googleLink.href = links.google;
    wazeLink.href = links.waze;
    neshanLink.href = links.neshan;
    baladLink.href = links.balad;

    googleLink.classList.add("active");
    wazeLink.classList.add("active");
    neshanLink.classList.add("active");
    baladLink.classList.add("active");

    apps.classList.add("visible");
}

function getHistory() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveHistory(input) {
    let history = getHistory();

    history = history.filter(item => item.url !== input);

    history.unshift({
        url: input,
        createdAt: Date.now()
    });

    history = history.slice(0, 30);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    renderHistory();
}

function deleteHistoryItem(index) {
    const history = getHistory();

    if (!history[index]) {
        return;
    }

    const shouldDelete = window.confirm("آیا از حذف این مکان از تاریخچه مطمئن هستید؟");

    if (!shouldDelete) {
        return;
    }

    history.splice(index, 1);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    renderHistory();
}

function clearHistory() {
    const history = getHistory();

    if (!history.length) {
        return;
    }

    const shouldDelete = window.confirm("آیا می‌خواهید تمام مکان‌های ذخیره‌شده حذف شوند؟");

    if (!shouldDelete) {
        return;
    }

    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
}

function formatDate(timestamp) {
    try {
        return new Intl.DateTimeFormat("fa-IR", {
            dateStyle: "short",
            timeStyle: "short"
        }).format(new Date(timestamp));
    } catch {
        return new Date(timestamp).toLocaleString("fa-IR");
    }
}

function renderHistory() {
    const history = getHistory();

    historyList.innerHTML = "";

    if (!history.length) {
    historyList.innerHTML = `
        <div class="empty-history">
        هنوز مکانی ذخیره نشده است.
        </div>
    `;

    return;
    }

    history.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "history-item";

        const info = document.createElement("div");
        info.className = "history-info";

        const url = document.createElement("div");
        url.className = "history-url";
        url.textContent = item.url;
        url.title = item.url;

        const date = document.createElement("div");
        date.className = "history-date";
        date.textContent = formatDate(item.createdAt);

        info.appendChild(url);
        info.appendChild(date);

        const actions = document.createElement("div");
        actions.className = "history-actions";

        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.className = "history-open";
        openButton.textContent = "تبدیل";

        openButton.addEventListener("click", () => {
            urlInput.value = item.url;
            convertLink();

            window.scrollTo({
            top: 0,
            behavior: "smooth"
            });
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "history-delete";
        deleteButton.textContent = "حذف";

        deleteButton.addEventListener("click", () => {
            deleteHistoryItem(index);
        });

        actions.appendChild(openButton);
        actions.appendChild(deleteButton);

        row.appendChild(info);
        row.appendChild(actions);

        historyList.appendChild(row);
    });
}

function convertLink() {
    clearMessage();
    resetOutputLinks();

    const input = urlInput.value.trim();

    if (!input) {
        showMessage("لطفاً یک لینک مکان وارد کنید.");
        return;
    }

    const coordinates = extractCoordinates(input);

    if (!coordinates) {
        showMessage("مختصات مکان از این لینک قابل استخراج نیست. لطفاً لینک کامل مکان را وارد کنید.");
        return;
    }

    const { lat, lng } = coordinates;

    if (!isValidCoordinates(lat, lng)) {
        showMessage("مختصات واردشده معتبر نیست.");
        return;
    }

    const links = createMapLinks(lat, lng);

    setOutputLinks(links);
    saveHistory(input);

    showMessage(`مختصات با موفقیت استخراج شد: ${lat}, ${lng}`, "success");
}

convertBtn.addEventListener("click", convertLink);

urlInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        convertLink();
    }
});

clearHistoryBtn.addEventListener("click", clearHistory);
resetOutputLinks();
renderHistory();