// ==UserScript==
// @name         GeoFS GMRP Missile List
// @namespace
// @author       cynkcrl
// @version      v1.0
// @description  A draggable box containing the GMRP missile list. Click a missile to lock on.
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @match        https://www.geo-fs.com/geofs.php*
// @grant        none
// ==/UserScript==

(function () {
"use strict";

const transparency = 0;
const LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Military_service_mark_of_the_United_States_Air_Force.svg/langfr-960px-Military_service_mark_of_the_United_States_Air_Force.svg.png";

const data = [
    // FOX 1 — CHAFF (blue)
    ["aim7",        "CHAFF"],
    ["aim9c",       "CHAFF"],
    ["super530",    "CHAFF"],
    ["pl11",        "CHAFF"],
    ["r27r",        "CHAFF"],
    ["r33",         "CHAFF"],
    ["r23r",        "CHAFF"],
    ["aspide",      "CHAFF"],
    ["k13r",        "CHAFF"],
    ["r40rd",       "CHAFF"],

    // FOX 2 — FLARE (red)
    ["aim9",        "FLARE"],
    ["asraam",      "FLARE"],
    ["irist",       "FLARE"],
    ["aam3",        "FLARE"],
    ["bozdogan",    "FLARE"],
    ["merlin",      "FLARE"],
    ["python5",     "FLARE"],
    ["magic2",      "FLARE"],
    ["r510",        "FLARE"],
    ["r530",        "FLARE"],
    ["maa1a",       "FLARE"],
    ["maa1b",       "FLARE"],
    ["micair",      "FLARE"],
    ["pl9",         "FLARE"],
    ["r60",         "FLARE"],
    ["r27t",        "FLARE"],
    ["skysword1",   "FLARE"],
    ["tc1",         "FLARE"],
    ["r73",         "FLARE"],
    ["adarter",     "FLARE"],

    // FOX 3 — FOX3 (purple)
    ["aim120",      "FOX3"],
    ["meteor",      "FOX3"],
    ["astramk1",    "FOX3"],
    ["aam4",        "FOX3"],
    ["gokdogan",    "FOX3"],
    ["peregrine",   "FOX3"],
    ["derby",       "FOX3"],
    ["r511",        "FOX3"],
    ["rdarter",     "FOX3"],
    ["micaem",      "FOX3"],
    ["pl15",        "FOX3"],
    ["r77",         "FOX3"],
    ["r27ea",       "FOX3"],
    ["skysword2",   "FOX3"],
    ["tc2",         "FOX3"],
    ["aim174b",     "FOX3"],
    ["r37",         "FOX3"],
    ["pl12",        "FOX3"],
    ["fakour90",    "FOX3"],
];

const bgOpacity = 1 - (Math.max(0, Math.min(10, transparency)) / 10);

/* ---------- State ---------- */

let awaitingAway = false;

/* ---------- Chat helpers ---------- */

function findChatInput() {
    var selectors = [
        'input.geofs-chat-input',
        '#geofs-chat-input',
        '.geofs-chat input[type="text"]',
        'input[placeholder*="chat" i]',
        'input[placeholder*="message" i]',
        '.geofs-ui-bottom input',
        'input[type="text"]',
    ];
    for (var i = 0; i < selectors.length; i++) {
        var el = document.querySelector(selectors[i]);
        if (el && el.offsetParent !== null) return el;
    }
    return null;
}

function setInputValue(input, val) {
    var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    if (setter && setter.set) setter.set.call(input, val);
    else input.value = val;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

function openChatAndPasteAway() {
    // Step 1: simulate T keydown to reopen chat
    try {
        if (window.ui && window.ui.chat && typeof window.ui.chat.showInput === 'function') {
            window.ui.chat.showInput();
        }
    } catch (e) {}

    // Also fire a real T keydown in case GeoFS needs it
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 't', keyCode: 84, bubbles: true }));

    // Step 2: wait for chat to reopen, then paste "away"
    setTimeout(function () {
        var input = findChatInput();
        if (input) {
            setInputValue(input, 'away');
            input.focus();
            input.setSelectionRange(5, 5);
        }
    }, 250);
}

/* ---------- Lock-on paste ---------- */

function lockOn(missileName) {
    const msg = 'locking ' + missileName + ' on ';
    try {
        if (window.ui && window.ui.chat && typeof window.ui.chat.showInput === 'function') {
            window.ui.chat.showInput();
        }
    } catch (e) {}

    setTimeout(function () {
        var input = findChatInput();
        if (input) {
            setInputValue(input, msg);
            input.focus();
            input.setSelectionRange(msg.length, msg.length);
            awaitingAway = true;
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(msg);
        }
    }, 150);
}

/* ---------- Detect Enter on lock-on message ---------- */

document.addEventListener('keydown', function (e) {
    if (!awaitingAway) return;
    if (e.key !== 'Enter') return;

    var input = findChatInput();
    if (!input) { awaitingAway = false; return; }

    var val = input.value;

    // Make sure it's actually the lock-on message and has a target typed
    if (!val.startsWith('locking ') || val.trimEnd().endsWith(' on')) {
        awaitingAway = false;
        return;
    }

    awaitingAway = false;

    // Wait for GeoFS to process the Enter and close chat, then reopen with "away"
    setTimeout(function () {
        openChatAndPasteAway();
    }, 350);

}, true);

/* ---------- Box ---------- */

const box = document.createElement("div");
box.id = "cmDragBox";

box.innerHTML = `
<div id="cmInfo">
    <img src="${LOGO}" id="cmLogo">
    <span class="FLARE">red = flare</span>&nbsp;
    <span class="CHAFF">blue = chaff</span><br>
    <span class="FOX3">purple = active radar</span><br>
    <span style="color:#aaa;font-size:10px">click → type target → enter → press enter on "away"</span><br>
    <span style="color:#aaa;font-size:10px">right-ctrl to hide</span>
</div>
`;

setTimeout(() => {
    box.innerHTML = data.map(([name, cls]) =>
        `<span class="cm-missile ${cls}" data-name="${name}">${name}</span>`
    ).join(' ');

    box.addEventListener('click', function (e) {
        const el = e.target.closest('.cm-missile');
        if (!el) return;
        lockOn(el.dataset.name);
        el.style.opacity = '0.3';
        setTimeout(() => { el.style.opacity = '1'; }, 300);
    });
}, 5000);

/* ---------- Style ---------- */

const style = document.createElement("style");
style.textContent = `
#cmDragBox {
    position: fixed;
    top: 40px;
    right: 40px;
    background: rgba(0,0,0,${bgOpacity});
    color: white;
    padding: 7px 10px;
    font-size: 12.5px;
    border-radius: 6px;
    width: 280px;
    line-height: 16px;
    z-index: 999999;
    cursor: move;
    user-select: none;
    font-family: 'Courier New', Courier, monospace;
}

.cm-missile {
    margin-right: 6px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    display: inline-block;
    transition: opacity 0.15s;
}

.cm-missile:hover { text-decoration: underline; }

.CHAFF { color: #4ab3ff; }
.FLARE { color: #ff5b5b; }
.FOX3  { color: #c97fff; }

#cmInfo {
    font-weight: 600;
    line-height: 18px;
    text-align: center;
}

#cmLogo {
    width: 42px;
    display: block;
    margin: 0 auto 6px auto;
}
`;

document.body.appendChild(style);
document.body.appendChild(box);

/* ---------- Dragging ---------- */

let isDown = false, offsetX = 0, offsetY = 0;

box.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains('cm-missile')) return;
    isDown = true;
    offsetX = e.clientX - box.offsetLeft;
    offsetY = e.clientY - box.offsetTop;
    e.preventDefault();
});

document.addEventListener("mouseup", () => { isDown = false; });

document.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    box.style.left = (e.clientX - offsetX) + "px";
    box.style.top  = (e.clientY - offsetY) + "px";
    box.style.right = "auto";
});

/* ---------- Hide Toggle ---------- */

document.addEventListener("keydown", (e) => {
    if (e.code === "ControlRight") {
        box.style.display = box.style.display === "none" ? "block" : "none";
    }
});

})();
