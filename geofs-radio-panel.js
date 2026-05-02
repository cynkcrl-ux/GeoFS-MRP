// ==UserScript==
// @name         GeoFS Radio Panel
// @namespace    GeoFS-Radio-Panel
// @version      1.0
// @description  Radio message panel for GeoFS military & civilian roleplay
// @author       cynkcrl
// @match        *://geo-fs.com/geofs.php*
// @match        *://www.geo-fs.com/geofs.php*
// @match        *://*.geo-fs.com/geofs.php*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const CALLSIGN = 'Mojave-1';

    const CATEGORIES = [
        {
            id: 'mil',
            label: 'MILITARY',
            color: '#e8a020',
            open: true,
            messages: [
                'requesting departure clearance',
                'requesting taxi to runway',
                'airborne, climbing',
                'form up on me',
                'hold position',
                'rejoin',
                'cover me',
                'turning',
                'climb',
                'stay low',
                'tally',
                'no tally',
                'contact front',
                'bandit spotted',
                'defensive',
                'taking fire',
                'target down',
                'lost contact',
                'bingo fuel, returning',
                'returning to base',
                'mission complete',
                'declaring emergency',
            ],
        },
        {
            id: 'civ',
            label: 'CIVILIAN',
            color: '#40c878',
            open: false,
            messages: [
                'requesting pushback and start',
                'requesting taxi to runway',
                'ready for departure',
                'airborne, departing',
                'request vectors for approach',
                'traffic in sight',
                'negative visual',
                'passing above',
                'passing below',
                'maintaining present heading',
                'turning left',
                'turning right',
                'climbing',
                'descending',
                'holding position',
                'continuing approach',
                'extending downwind',
                'short final',
                'clear of runway',
                'taxiing to gate',
            ],
        },
        {
            id: 'atc',
            label: 'ATC',
            color: '#60b8ff',
            open: false,
            messages: [
                'cleared for takeoff',
                'cleared to land',
                'go around',
                'hold short of runway',
                'line up and wait',
                'traffic in your area',
                'contact approach frequency',
                'airspace closed, hold position',
                'squawk ident',
                'climb and maintain',
                'descend and maintain',
                'turn heading',
            ],
        },
        {
            id: 'emg',
            label: 'EMERGENCY',
            color: '#ff5050',
            open: false,
            messages: [
                'mayday mayday mayday',
                'declaring emergency',
                'engine failure',
                'request immediate landing',
                'minimum fuel',
                'smoke in cockpit',
                'loss of control',
                'diverting',
                'medical emergency',
            ],
        },
    ];

    // ── Inject panel ──────────────────────────────────────────────────────────
    function init() {
        if (document.getElementById('grp-panel')) return;

        const style = document.createElement('style');
        style.textContent = `
#grp-panel {
    position: fixed !important;
    top: 70px !important;
    right: 12px !important;
    width: 220px;
    z-index: 2147483647 !important;
    background: rgba(8, 12, 20, 0.96) !important;
    border: 1px solid #2a3a52 !important;
    border-radius: 7px !important;
    font-family: 'Courier New', Courier, monospace !important;
    color: #b0c4d8 !important;
    font-size: 11px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.7) !important;
    overflow: hidden !important;
}
#grp-panel * { box-sizing: border-box !important; }
#grp-header {
    background: rgba(5, 8, 15, 0.98) !important;
    padding: 7px 9px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    cursor: grab !important;
    border-bottom: 1px solid #1e2e42 !important;
    user-select: none !important;
}
#grp-header:active { cursor: grabbing !important; }
#grp-title {
    font-size: 10px !important;
    font-weight: bold !important;
    letter-spacing: 1.5px !important;
    color: #5aaeff !important;
    text-transform: uppercase !important;
}
#grp-callsign {
    font-size: 9px !important;
    color: #5aaeff !important;
    background: rgba(20, 50, 90, 0.6) !important;
    border: 1px solid #1e4070 !important;
    border-radius: 3px !important;
    padding: 1px 5px !important;
    margin-left: 5px !important;
    letter-spacing: 0.5px !important;
}
.grp-hbtn {
    background: #0e1a2a !important;
    border: 1px solid #2a3a52 !important;
    border-radius: 3px !important;
    color: #5a7a9a !important;
    cursor: pointer !important;
    padding: 1px 6px !important;
    font-size: 11px !important;
    font-family: monospace !important;
    margin-left: 3px !important;
    line-height: 1.4 !important;
}
.grp-hbtn:hover { background: #1a2e48 !important; color: #90c0e8 !important; }
.grp-section { border-bottom: 1px solid #141e2a !important; }
.grp-sechead {
    padding: 5px 9px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    cursor: pointer !important;
    background: rgba(10, 14, 22, 0.9) !important;
    user-select: none !important;
}
.grp-sechead:hover { background: rgba(18, 28, 42, 0.95) !important; }
.grp-seclabel {
    font-size: 9.5px !important;
    letter-spacing: 1px !important;
    text-transform: uppercase !important;
    font-weight: bold !important;
}
.grp-chev {
    font-size: 7px !important;
    color: #304050 !important;
    transition: transform 0.12s !important;
    display: inline-block !important;
}
.grp-chev.open { transform: rotate(90deg) !important; }
.grp-msglist { padding: 2px 0 !important; }
.grp-msglist.hidden { display: none !important; }
.grp-msg {
    padding: 5px 10px 5px 13px !important;
    cursor: pointer !important;
    font-size: 10px !important;
    color: #7090a8 !important;
    border-left: 2px solid transparent !important;
    display: flex !important;
    align-items: flex-start !important;
    gap: 6px !important;
    line-height: 1.45 !important;
}
.grp-msg:hover {
    background: rgba(15, 30, 55, 0.95) !important;
    color: #d8eeff !important;
    border-left-color: #5aaeff !important;
}
.grp-dot {
    width: 5px !important;
    height: 5px !important;
    border-radius: 50% !important;
    flex-shrink: 0 !important;
    margin-top: 3px !important;
}
#grp-foot {
    padding: 4px 9px !important;
    font-size: 9px !important;
    color: #2a4050 !important;
    letter-spacing: 0.5px !important;
    background: rgba(4, 6, 10, 0.98) !important;
    display: flex !important;
    align-items: center !important;
    gap: 5px !important;
}
#grp-dot-live {
    width: 5px !important;
    height: 5px !important;
    border-radius: 50% !important;
    background: #30c060 !important;
    animation: grpblink 1.8s infinite !important;
    flex-shrink: 0 !important;
}
@keyframes grpblink { 0%,100%{opacity:1} 50%{opacity:0.2} }
#grp-panel.grp-minimized #grp-body,
#grp-panel.grp-minimized #grp-foot { display: none !important; }
        `;
        document.head.appendChild(style);

        const panel = document.createElement('div');
        panel.id = 'grp-panel';

        // Header
        const header = document.createElement('div');
        header.id = 'grp-header';
        header.innerHTML =
            '<span id="grp-title">\u2708 Radio<span id="grp-callsign">' + CALLSIGN + '</span></span>' +
            '<div style="display:flex;align-items:center">' +
            '<button class="grp-hbtn" id="grp-collapseall" title="Collapse all">\u2212</button>' +
            '<button class="grp-hbtn" id="grp-minbtn" title="Minimize">\u25BC</button>' +
            '</div>';
        panel.appendChild(header);

        // Body
        const body = document.createElement('div');
        body.id = 'grp-body';

        CATEGORIES.forEach(function (cat) {
            const sec = document.createElement('div');
            sec.className = 'grp-section';

            const secHead = document.createElement('div');
            secHead.className = 'grp-sechead';
            secHead.innerHTML =
                '<span class="grp-seclabel" style="color:' + cat.color + '">' + cat.label + '</span>' +
                '<span class="grp-chev ' + (cat.open ? 'open' : '') + '" id="grp-chev-' + cat.id + '">\u25BA</span>';

            const list = document.createElement('div');
            list.className = 'grp-msglist' + (cat.open ? '' : ' hidden');
            list.id = 'grp-list-' + cat.id;

            cat.messages.forEach(function (msg) {
                const full = CALLSIGN + ', ' + msg;
                const row = document.createElement('div');
                row.className = 'grp-msg';
                row.innerHTML =
                    '<span class="grp-dot" style="background:' + cat.color + '"></span>' +
                    '<span>' + msg + '</span>';
                row.title = 'Click to send: ' + full;
                row.addEventListener('click', function () { pasteMessage(full); });
                list.appendChild(row);
            });

            secHead.addEventListener('click', function () {
                list.classList.toggle('hidden');
                document.getElementById('grp-chev-' + cat.id).classList.toggle('open');
            });

            sec.appendChild(secHead);
            sec.appendChild(list);
            body.appendChild(sec);
        });

        panel.appendChild(body);

        // Footer
        const foot = document.createElement('div');
        foot.id = 'grp-foot';
        foot.innerHTML = '<div id="grp-dot-live"></div><span id="grp-status">READY</span>';
        panel.appendChild(foot);

        document.body.appendChild(panel);

        // Collapse all button
        document.getElementById('grp-collapseall').addEventListener('click', function (e) {
            e.stopPropagation();
            CATEGORIES.forEach(function (cat) {
                document.getElementById('grp-list-' + cat.id).classList.add('hidden');
                document.getElementById('grp-chev-' + cat.id).classList.remove('open');
            });
        });

        // Minimize button
        var minimized = false;
        document.getElementById('grp-minbtn').addEventListener('click', function (e) {
            e.stopPropagation();
            minimized = !minimized;
            panel.classList.toggle('grp-minimized', minimized);
            this.textContent = minimized ? '\u25B2' : '\u25BC';
        });

        // Drag to move
        var dragging = false, ox = 0, oy = 0;
        header.addEventListener('mousedown', function (e) {
            if (e.target.closest && e.target.closest('.grp-hbtn')) return;
            if (e.target.classList && e.target.classList.contains('grp-hbtn')) return;
            dragging = true;
            var r = panel.getBoundingClientRect();
            ox = e.clientX - r.left;
            oy = e.clientY - r.top;
            e.preventDefault();
        });
        document.addEventListener('mousemove', function (e) {
            if (!dragging) return;
            panel.style.left = (e.clientX - ox) + 'px';
            panel.style.top  = (e.clientY - oy) + 'px';
            panel.style.right = 'auto';
        });
        document.addEventListener('mouseup', function () { dragging = false; });
    }

    // ── Send message ──────────────────────────────────────────────────────────
    function pasteMessage(msg) {
        try {
            if (window.ui && window.ui.chat && typeof window.ui.chat.showInput === 'function') {
                window.ui.chat.showInput();
            }
        } catch (e) {}

        setTimeout(function () {
            var input = findChatInput();
            if (input) {
                var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
                if (setter && setter.set) {
                    setter.set.call(input, msg);
                } else {
                    input.value = msg;
                }
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.focus();
                setStatus('TX \u25B6 ' + msg.slice(0, 22) + (msg.length > 22 ? '\u2026' : ''));
            } else {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(msg).then(function () {
                        setStatus('COPIED \u2014 PASTE IN CHAT');
                    }).catch(function () {
                        setStatus('OPEN CHAT WITH T FIRST');
                    });
                } else {
                    setStatus('OPEN CHAT WITH T FIRST');
                }
            }
            setTimeout(function () { setStatus('READY'); }, 3000);
        }, 150);
    }

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

    function setStatus(text) {
        var el = document.getElementById('grp-status');
        if (el) el.textContent = text;
    }

    // ── T-key fix ─────────────────────────────────────────────────────────────
    window.addEventListener('keydown', function (e) {
        var tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea') return;
        if (e.key === 't' || e.key === 'T') {
            e.preventDefault();
            e.stopPropagation();
            try { window.ui.chat.showInput(); } catch (err) {}
        }
    }, true);

    // ── Boot ──────────────────────────────────────────────────────────────────
    function tryInit() {
        if (document.body) {
            init();
        } else {
            setTimeout(tryInit, 300);
        }
    }

    tryInit();
    window.addEventListener('load', function () {
        setTimeout(init, 500);
        setTimeout(init, 2000);
        setTimeout(init, 5000);
    });

})();
