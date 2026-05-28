// Production Live Render Backend Endpoint Link
const BACKEND_URL = 'https://streamdrop-yzkt.onrender.com'; 

const navHome = document.getElementById('navHome');
const navHistory = document.getElementById('navHistory');
const homeSection = document.getElementById('homeSection');
const historySection = document.getElementById('historySection');
const videoUrlInput = document.getElementById('videoUrl');
const analyzeBtn = document.getElementById('analyzeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const qualitySelect = document.getElementById('qualitySelect');
const loader = document.getElementById('loader');
const loaderText = document.getElementById('loaderText');
const errorMessage = document.getElementById('errorMessage');
const previewCard = document.getElementById('previewCard');
const videoThumb = document.getElementById('videoThumb');
const videoTitle = document.getElementById('videoTitle');
const videoDuration = document.getElementById('videoDuration');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

let activeVideoData = null;

navHome.addEventListener('click', () => switchTab(homeSection, navHome));
navHistory.addEventListener('click', () => { switchTab(historySection, navHistory); renderHistory(); });

function switchTab(targetSection, activeNavButton) {
    [homeSection, historySection].forEach(s => s.classList.add('hidden'));
    [navHome, navHistory].forEach(b => b.classList.remove('active'));
    targetSection.classList.remove('hidden');
    activeNavButton.classList.add('active');
    hideError();
}

analyzeBtn.addEventListener('click', async () => {
    const url = videoUrlInput.value.trim();
    if (!url) return showError('Please paste a video URL first.');
    hideError();
    previewCard.classList.add('hidden');
    showLoader('Analyzing source media structure...');

    try {
        const res = await fetch(`${BACKEND_URL}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed analysis');

        activeVideoData = data;
        videoThumb.src = data.thumbnail;
        videoTitle.textContent = data.title;
        videoDuration.textContent = `Duration: ${data.duration}`;
        hideLoader();
        previewCard.classList.remove('hidden');
    } catch (err) {
        hideLoader();
        showError(err.message);
    }
});

downloadBtn.addEventListener('click', async () => {
    if (!activeVideoData) return;
    const selectedQuality = qualitySelect.value;
    hideError();
    showLoader('Processing file on server... Please wait.');

    try {
        const res = await fetch(`${BACKEND_URL}/api/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: activeVideoData.originalUrl, quality: selectedQuality })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Download failed');

        hideLoader();
        saveToHistory({
            title: activeVideoData.title,
            quality: selectedQuality,
            fileUrl: data.downloadUrl,
            timestamp: new Date().toLocaleString()
        });
        window.open(data.downloadUrl, '_blank');
    } catch (err) {
        hideLoader();
        showError(err.message);
    }
});

function saveToHistory(item) {
    let history = JSON.parse(localStorage.getItem('dl_history')) || [];
    history.unshift(item);
    localStorage.setItem('dl_history', JSON.stringify(history));
}

function renderHistory() {
    historyList.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('dl_history')) || [];
    if (history.length === 0) {
        historyList.innerHTML = `<p class="subtitle" style="text-align:center;">No downloads recorded.</p>`;
        clearHistoryBtn.classList.add('hidden');
        return;
    }
    clearHistoryBtn.classList.remove('hidden');
    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <div style="max-width:70%;">
                <div class="history-title">${item.title}</div>
                <div class="history-meta">${item.timestamp} | ${item.quality}</div>
            </div>
            <a href="${item.fileUrl}" class="btn-inline-dl" download>Save</a>
        `;
        historyList.appendChild(li);
    });
}

clearHistoryBtn.addEventListener('click', () => { localStorage.removeItem('dl_history'); renderHistory(); });
function showLoader(t) { loaderText.textContent = t; loader.classList.remove('hidden'); }
function hideLoader() { loader.classList.add('hidden'); }
function showError(m) { errorMessage.textContent = m; errorMessage.classList.remove('hidden'); }
function hideError() { errorMessage.classList.add('hidden'); }

let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; installBtn.classList.remove('hidden'); });
installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') installBtn.classList.add('hidden');
    deferredPrompt = null;
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(err => console.log(err)); });
}
    }
    clearHistoryBtn.classList.remove('hidden');
    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <div style="max-width:70%;">
                <div class="history-title">${item.title}</div>
                <div class="history-meta">${item.timestamp} | ${item.quality}</div>
            </div>
            <a href="${item.fileUrl}" class="btn-inline-dl" download>Save</a>
        `;
        historyList.appendChild(li);
    });
}

clearHistoryBtn.addEventListener('click', () => { localStorage.removeItem('dl_history'); renderHistory(); });
function showLoader(t) { loaderText.textContent = t; loader.classList.remove('hidden'); }
function hideLoader() { loader.classList.add('hidden'); }
function showError(m) { errorMessage.textContent = m; errorMessage.classList.remove('hidden'); }
function hideError() { errorMessage.classList.add('hidden'); }

let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; installBtn.classList.remove('hidden'); });
installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') installBtn.classList.add('hidden');
    deferredPrompt = null;
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(err => console.log(err)); });
}
