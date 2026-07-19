(function (global) {
    'use strict';
    global.cleanText = function (element) {
        if (!element) return '';

        return element.textContent
            .replace(/\s+/g, ' ')
            .trim();
    }

    global.isTypingTarget = function (element) {
        if (!element) return false;

        const tagName = element.tagName?.toLowerCase();

        return (
            tagName === 'input' ||
            tagName === 'textarea' ||
            tagName === 'select' ||
            element.isContentEditable
        );
    }

  
})(globalThis);


