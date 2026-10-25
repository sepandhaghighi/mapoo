const STORAGE_KEY = "mapooHistory";
const MAPOO_VERSION = "0.4";

const urlInput = document.getElementById("url-input");
const nameInput = document.getElementById("name-input");
const convertBtn = document.getElementById("convert-btn");
const message = document.getElementById("message");
const apps = document.getElementById("apps");

const googleLink = document.getElementById("google-link");
const wazeLink = document.getElementById("waze-link");
const neshanLink = document.getElementById("neshan-link");
const baladLink = document.getElementById("balad-link");
const osmLink = document.getElementById("osm-link");
const appleLink = document.getElementById("apple-link");
const yandexLink = document.getElementById("yandex-link");


const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const appVersion = document.getElementById("app-version");

const locationPreview = document.getElementById("location-preview");
const previewLocationName = document.getElementById("preview-location-name");
const previewExpandBtn = document.getElementById("preview-expand-btn");

let previewMap = null;
let previewMarker = null;

function toPersianDigits(value) {
    return String(value)
        .replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[digit])
        .replace(/\./g, "٫");
}

function formatCoordinates(lat, lng) {
    return {
        lat: toPersianDigits(lat),
        lng: toPersianDigits(lng)
    };
}

function renderAppVersion() {
    appVersion.textContent = ` · نسخه ${toPersianDigits(MAPOO_VERSION)}`;
}

function resetOutputLinks() {
    apps.classList.remove("visible");

    locationPreview.hidden = true;
    locationPreview.classList.remove("is-expanded");

    previewExpandBtn.setAttribute("aria-expanded", "false");
    previewExpandBtn.setAttribute("aria-label", "نمایش نقشه در اندازه بزرگ‌تر");
    previewExpandBtn.innerHTML = '<i class="fa-solid fa-expand" aria-hidden="true"></i>';

    const links = [googleLink, wazeLink, neshanLink, baladLink, osmLink, appleLink, yandexLink];

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

    const yandexMatch = value.match(/(?:^|[/?#])maps\.yandex\.[^/?#]+\/(?:[^?#]*\/)?(?:\?[^#]*&)?ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:&|#|$)/i);

    if (yandexMatch) {
        const lng = Number(yandexMatch[1]);
        const lat = Number(yandexMatch[2]);

        if (isValidCoordinates(lat, lng)) {
            return { lat, lng };
        }
    }

    const yandexRouteMatch = value.match(/(?:^|[?&])rtext=[^&]*?(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:%7E|~|%3B|;|&|$)/i);

    if (yandexRouteMatch) {
        const lat = Number(yandexRouteMatch[1]);
        const lng = Number(yandexRouteMatch[2]);

        if (isValidCoordinates(lat, lng)) {
            return { lat, lng };
        }
    }

    const appleMaps = value.match(/(?:[?&](?:coordinate|ll|q|center)=|@)(-?\d+(?:\.\d+)?)(?:,|%2C|%2c)\s*(-?\d+(?:\.\d+)?)/);

    if (appleMaps) {
        const lat = Number(appleMaps[1]);
        const lng = Number(appleMaps[2]);
        if (isValidCoordinates(lat, lng)) {
            return { lat, lng };
        }
    }

    const osmLatFirst = value.match(/[?&]mlat=(-?\d+(?:\.\d+)?)(?:&|#|$)/);

    const osmLonFirst = value.match(/[?&]mlon=(-?\d+(?:\.\d+)?)(?:&|#|$)/);

    if (osmLatFirst && osmLonFirst) {
        const lat = Number(osmLatFirst[1]);
        const lng = Number(osmLonFirst[1]);

        if (isValidCoordinates(lat, lng)) {
            return { lat, lng };
        }
    }

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

function updatePageUrl(lat, lng, name = "") {
    const url = new URL(window.location.href);

    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lng", String(lng));

    const normalizedName = String(name).trim().slice(0, 100);

    if (normalizedName) {
        url.searchParams.set("name", normalizedName);
    } else {
        url.searchParams.delete("name");
    }

    window.history.replaceState(window.history.state, "", url);
}

function resetPageUrl() {
    const url = new URL(window.location.href);

    url.searchParams.delete("lat");
    url.searchParams.delete("lng");
    url.searchParams.delete("name");

    window.history.replaceState(window.history.state, "", url);
}

function loadLocationFromUrl() {
    const params = new URLSearchParams(window.location.search);

    if (!params.has("lat") || !params.has("lng")) {
        return;
    }

    const latValue = params.get("lat");
    const lngValue = params.get("lng");

    if (
        latValue === null ||
        lngValue === null ||
        latValue.trim() === "" ||
        lngValue.trim() === ""
    ) {
        showMessage("پارامترهای مختصات در لینک معتبر نیستند.");
        return;
    }

    const lat = Number(latValue);
    const lng = Number(lngValue);
    const name = (params.get("name") || "").trim().slice(0, 100);

    if (!isValidCoordinates(lat, lng)) {
        showMessage("مختصات واردشده در لینک معتبر نیست.");
        return;
    }

    urlInput.value = `${lat}, ${lng}`;
    nameInput.value = name;
}

function createMapLinks(lat, lng) {
    return {
        google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,

        waze: `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`,

        neshan: `https://neshan.org/maps/share/${lat},${lng}`,

        balad: `https://balad.ir/location?latitude=${lat}&longitude=${lng}&zoom=16.5`,

        osm: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`,

        apple: `https://maps.apple.com/?q=${lat},${lng}&ll=${lat},${lng}`,

        yandex: `https://yandex.com/maps/?ll=${lng},${lat}&z=16&pt=${lng},${lat}`,

    };
}

function setOutputLinks(links) {
    googleLink.href = links.google;
    wazeLink.href = links.waze;
    neshanLink.href = links.neshan;
    baladLink.href = links.balad;
    osmLink.href = links.osm;
    appleLink.href = links.apple;

    googleLink.classList.add("active");
    wazeLink.classList.add("active");
    neshanLink.classList.add("active");
    baladLink.classList.add("active");
    osmLink.classList.add("active");
    appleLink.classList.add("active");

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

function normalizeCoordinate(value) {
    return Number(Number(value).toFixed(6));
}

function saveHistory(lat, lng, name = "") {
    let history = getHistory();

    const normalizedLat = normalizeCoordinate(lat);
    const normalizedLng = normalizeCoordinate(lng);
    const normalizedName = String(name).trim().slice(0, 100);

    history = history.filter(item => {
        return !(
            Number(item.lat) === normalizedLat &&
            Number(item.lng) === normalizedLng
        );
    });

    history.unshift({
        lat: normalizedLat,
        lng: normalizedLng,
        name: normalizedName,
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

    const shouldDelete = window.confirm("آیا از حذف این مورد از تاریخچه اطمینان دارید؟");

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

    const shouldDelete = window.confirm("آیا از حذف تمام موارد تاریخچه اطمینان دارید؟");

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

    clearHistoryBtn.disabled = history.length === 0;
    
    historyList.innerHTML = "";

    if (!history.length) {
    historyList.innerHTML = `
        <div class="empty-history">
        هنوز موردی ذخیره نشده است.
        </div>
    `;

    return;
    }

    history.forEach((item, index) => {
        const formatted = formatCoordinates(item.lat, item.lng);
        const row = document.createElement("div");
        row.className = "history-item";

        const info = document.createElement("div");
        info.className = "history-info";


        const coordinates = document.createElement("div");
        coordinates.className = "history-coordinates";

        const latitude = document.createElement("div");
        latitude.className = "coordinate-line";
        latitude.textContent = `عرض جغرافیایی: ${formatted.lat}`;

        const longitude = document.createElement("div");
        longitude.className = "coordinate-line";
        longitude.textContent = `طول جغرافیایی: ${formatted.lng}`;

        coordinates.appendChild(latitude);
        coordinates.appendChild(longitude);


        const name = document.createElement("div");
        if (item.name) {
            name.className = "history-name";
            name.textContent = item.name;
            info.appendChild(name);
        }

        const date = document.createElement("div");
        date.className = "history-date";
        date.textContent = formatDate(item.createdAt);

        info.appendChild(coordinates);
        info.appendChild(date);

        const actions = document.createElement("div");
        actions.className = "history-actions";

        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.className = "history-open";
        openButton.innerHTML = '<i class="fa-solid fa-map-location-dot" aria-hidden="true"></i> بارگذاری';


        openButton.addEventListener("click", () => {
            const lat = Number(item.lat);
            const lng = Number(item.lng);

            if (!isValidCoordinates(lat, lng)) {
                showMessage("مختصات ذخیره‌شده معتبر نیست.");
                return;
            }

            urlInput.value = `${lat}, ${lng}`;
            nameInput.value = item.name || "";

            clearMessage();
            resetOutputLinks();
            resetPageUrl();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "history-delete";
        deleteButton.innerHTML = '<i class="fa-regular fa-trash-can" aria-hidden="true"></i> حذف';

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

function initializePreviewMap(lat, lng) {
    if (!previewMap) {
        previewMap = L.map("preview-map", {
            zoomControl: false,
            scrollWheelZoom: false
        });

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright" ' +
                'target="_blank" rel="noopener noreferrer">' +
                "OpenStreetMap contributors</a>"
        }).addTo(previewMap);

        L.control.zoom({ position: "topright" }).addTo(previewMap);

        previewMarker = L.marker([lat, lng]).addTo(previewMap);
    } else {
        previewMarker.setLatLng([lat, lng]);
    }

    previewMap.setView([lat, lng], 16);
}

function renderLocationPreview(lat, lng, name = "") {

    previewLocationName.textContent = name.trim() || "موقعیت شناسایی‌شده";

    locationPreview.hidden = false;
    setPreviewExpanded(false);
    initializePreviewMap(lat, lng);

    requestAnimationFrame(() => {
        previewMap.invalidateSize({ pan: false });
    });
}

function setPreviewExpanded(expanded) {
    locationPreview.classList.toggle("is-expanded", expanded);

    previewExpandBtn.setAttribute("aria-expanded", String(expanded));
    previewExpandBtn.setAttribute("aria-label", expanded ? "بازگشت به اندازه عادی نقشه" : "نمایش نقشه در اندازه بزرگ‌تر");

    previewExpandBtn.innerHTML = expanded ? '<i class="fa-solid fa-compress" aria-hidden="true"></i>' : '<i class="fa-solid fa-expand" aria-hidden="true"></i>';

    if (previewMap) {
        requestAnimationFrame(() => {
            previewMap.invalidateSize({ pan: false });
        });
    }
}

previewExpandBtn.addEventListener("click", () => {
    setPreviewExpanded(previewExpandBtn.getAttribute("aria-expanded") !== "true");
});

function convertLink() {
    clearMessage();
    resetOutputLinks();

    const input = urlInput.value.trim();
    const name = nameInput.value.trim();

    if (!input) {
        showMessage("لطفاً لینک نقشه یا مختصات جغرافیایی را وارد کنید.");
        return;
    }

    const coordinates = extractCoordinates(input);

    if (!coordinates) {
        showMessage("امکان استخراج مختصات از این لینک وجود ندارد. لطفاً لینک کامل نقشه یا مختصات جغرافیایی را وارد کنید.");
        return;
    }

    const { lat, lng } = coordinates;

    if (!isValidCoordinates(lat, lng)) {
        showMessage("مختصات واردشده معتبر نیست.");
        return;
    }

    const links = createMapLinks(lat, lng);

    setOutputLinks(links);
    renderLocationPreview(lat, lng, name);
    saveHistory(lat, lng, name);
    updatePageUrl(lat, lng, name);

    const locationLabel = name ? `«${name}»` : "مکان موردنظر";
    const formatted = formatCoordinates(lat, lng);
    showMessage(`${locationLabel} با موفقیت شناسایی شد. عرض جغرافیایی: ${formatted.lat}، طول جغرافیایی: ${formatted.lng}`, "success");

}

convertBtn.addEventListener("click", convertLink);

[urlInput, nameInput].forEach(input => {
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            convertLink();
        }
    });
});

clearHistoryBtn.addEventListener("click", clearHistory);
renderAppVersion();
resetOutputLinks();
renderHistory();
loadLocationFromUrl();
