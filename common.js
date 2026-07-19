    function cleanText(element) {
        if (!element) return '';

        return element.textContent
            .replace(/\s+/g, ' ')
            .trim();
    }

    function isTypingTarget(element) {
        if (!element) return false;

        const tagName = element.tagName?.toLowerCase();

        return (
            tagName === 'input' ||
            tagName === 'textarea' ||
            tagName === 'select' ||
            element.isContentEditable
        );
    }
