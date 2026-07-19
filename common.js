// common.js

(function (global) {
    "use strict";

    global.cleanText = function (element) {
        if (!element) return "";

        return element.textContent
            .replace(/\s+/g, " ")
            .trim();
    };

    global.findFirst = function (selectors, root = document) {
        for (const selector of selectors) {
            const element = root.querySelector(selector);

            if (element) {
                return element;
            }
        }

        return null;
    };

    console.log("common.js loaded");
})(globalThis);
