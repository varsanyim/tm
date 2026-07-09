// tm-console.js
(function () {
    'use strict';

    const DEFAULT_OPTIONS = {
        wrapperId: 'tm-console-wrapper',
        linesId: 'tm-console-lines',
        title: 'TM Console',
        width: '520px',
        height: '320px',
        maxLines: 200,
        position: {
            right: '10px',
            bottom: '10px'
        },
        minLevel: 0,
    };

    const LEVELS = {
        DEBUG: 10,
        INFO: 20,
        WARN: 50,
        ERROR: 100
    };

    let options = { ...DEFAULT_OPTIONS };
    let initialized = false;

    function mergeOptions(userOptions) {
        if (!userOptions) return;

        options = {
            ...options,
            ...userOptions,
            position: {
                ...options.position,
                ...(userOptions.position || {})
            }
        };
    }

    function getWrapper() {
        return document.getElementById(options.wrapperId);
    }

    function getLinesDiv() {
        return document.getElementById(options.linesId);
    }

    function stopPageClickHandlers(element) {
        const events = [
            'click',
            'mousedown',
            'mouseup',
            'pointerdown',
            'pointerup',
            'touchstart',
            'touchend'
        ];

        for (const eventName of events) {
            element.addEventListener(eventName, function (event) {
                event.stopPropagation();
            }, true);
        }
    }

    function createButton(text, onClick) {
        const button = document.createElement('button');

        button.textContent = text;
        button.style.cssText = `
            margin-left: 6px;
            font-size: 12px;
            cursor: pointer;
            background: #222;
            color: #eee;
            border: 1px solid #555;
            border-radius: 4px;
            padding: 2px 6px;
        `;

        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            onClick();
        });

        return button;
    }

    function createConsoleDiv() {
        let wrapper = getWrapper();

        if (wrapper) {
            return getLinesDiv();
        }

        wrapper = document.createElement('div');
        wrapper.id = options.wrapperId;

        // color: #eeeeee;
        wrapper.style.cssText = `
            position: fixed;
            right: ${options.position.right};
            bottom: ${options.position.bottom};
            width: ${options.width};
            height: ${options.height};
            z-index: 2147483647;
            background: rgba(0, 0, 0, 0.92);
            color: #00ff66;
            font-family: Arial, sans-serif;
            font-size: 13px;
            line-height: 1.4;
            border: 1px solid #00ff66;
            border-radius: 8px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            box-shadow: 0 0 12px rgba(0, 0, 0, 0.65);
            pointer-events: auto;
        `;

        stopPageClickHandlers(wrapper);

        const header = document.createElement('div');
        //             color: #ffffff;
        header.style.cssText = `
            flex: 0 0 auto;
            padding: 8px;
            color: #00ff66;
            border-bottom: 1px solid #333;
            background: rgba(0, 0, 0, 0.98);
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
        `;

        const title = document.createElement('span');
        title.textContent = options.title;

        const buttons = document.createElement('span');

        const clearButton = createButton('clear', clear);
        const hideButton = createButton('hide', hide);

        buttons.appendChild(clearButton);
        buttons.appendChild(hideButton);

        header.appendChild(title);
        header.appendChild(buttons);

        const lines = document.createElement('div');
        lines.id = options.linesId;

        lines.style.cssText = `
            flex: 1 1 auto;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 8px;
            box-sizing: border-box;
            font-family: monospace;
            white-space: pre-wrap;
        `;

        wrapper.appendChild(header);
        wrapper.appendChild(lines);

        const appendTarget = document.body || document.documentElement;
        appendTarget.appendChild(wrapper);

        return lines;
    }

    function stringifyValue(value) {
        if (value instanceof Error) {
            return value.stack || value.message;
        }

        if (typeof value === 'object' && value !== null) {
            try {
                return JSON.stringify(value, null, 2);
            } catch {
                return String(value);
            }
        }

        return String(value);
    }

    function normalizeLevel(level) {
        if (typeof level === 'string') {
            const upper = level.toUpperCase();

            if (upper === 'DEBUG') return LEVELS.DEBUG;
            if (upper === 'INFO') return LEVELS.INFO;
            if (upper === 'WARN') return LEVELS.WARN;
            if (upper === 'ERROR') return LEVELS.ERROR;
        }

        return Number(level);
    }

    function levelName(level) {
        const normalized = normalizeLevel(level);

        if (normalized >= LEVELS.ERROR) return 'ERROR';
        if (normalized >= LEVELS.WARN) return 'WARN';
        if (normalized >= LEVELS.INFO) return 'INFO';
        return 'DEBUG';
    }

    function levelColor(level) {
        const normalized = normalizeLevel(level);

        if (normalized >= LEVELS.ERROR) return '#ff5555';
        if (normalized >= LEVELS.WARN) return '#ffaa00';
        if (normalized >= LEVELS.INFO) return '#00ff66';
        // return '#cccccc';
        return '#00ff66';

    }

    function writeToBrowserConsole(level, args) {
        const normalized = normalizeLevel(level);

        if (normalized >= LEVELS.ERROR) {
            console.error(...args);
        } else if (normalized >= LEVELS.WARN) {
            console.warn(...args);
        } else {
            console.log(...args);
        }
    }

    function log(level, ...args) {
        const normalized = normalizeLevel(level);
    
        if (normalized < options.minLevel) {
            return;
        }
        ensure();

        const lines = getLinesDiv();
        if (!lines) return;

        const name = levelName(level);
        const color = levelColor(level);
        const timestamp = new Date().toLocaleTimeString();

        const message = args.map(stringifyValue).join(' ');

        const line = document.createElement('div');
        line.textContent = `[${timestamp}] [${name}] ${message}`;
        line.style.cssText = `
            color: ${color};
            margin-bottom: 6px;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        `;

        lines.appendChild(line);

        while (lines.children.length > options.maxLines) {
            lines.removeChild(lines.firstChild);
        }

        lines.scrollTop = lines.scrollHeight;

        writeToBrowserConsole(level, args);
    }

    function debug(...args) {
        log(LEVELS.DEBUG, ...args);
    }

    function info(...args) {
        log(LEVELS.INFO, ...args);
    }

    function warn(...args) {
        log(LEVELS.WARN, ...args);
    }

    function error(...args) {
        log(LEVELS.ERROR, ...args);
    }

    function clear() {
        const lines = getLinesDiv();

        if (lines) {
            lines.innerHTML = '';
        }
    }

    function show() {
        ensure();

        const wrapper = getWrapper();

        if (wrapper) {
            wrapper.style.display = 'flex';
        }
    }

    function hide() {
        const wrapper = getWrapper();

        if (wrapper) {
            wrapper.style.display = 'none';
        }
    }

    function toggle() {
        ensure();

        const wrapper = getWrapper();

        if (!wrapper) return;

        wrapper.style.display =
            wrapper.style.display === 'none' ? 'flex' : 'none';
    }

    function ensure() {
        if (!initialized || !getWrapper()) {
            createConsoleDiv();
            initialized = true;
        }
    }

    function init(userOptions) {
        mergeOptions(userOptions);
        ensure();
        return window.TMConsole;
    }

    function installToggleHotkey(key = 'l') {
        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey || event.altKey || event.metaKey) return;

            const active = document.activeElement;
            const tagName = active?.tagName?.toLowerCase();

            const isTyping =
                tagName === 'input' ||
                tagName === 'textarea' ||
                tagName === 'select' ||
                active?.isContentEditable;

            if (isTyping) return;

            if (event.key.toLowerCase() === key.toLowerCase()) {
                toggle();
            }
        });
    }

    window.TMConsole = {
        LEVELS,
        init,
        ensure,
        log,
        debug,
        info,
        warn,
        error,
        clear,
        show,
        hide,
        toggle,
        installToggleHotkey
    };
})();
