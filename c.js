document.addEventListener('DOMContentLoaded', function () {
    const editor = document.getElementById('editor');

    document.getElementById('applyFontSizeBtn').addEventListener('click', function () {
        const fontSize = document.getElementById('fontSizeInput').value;
        if (fontSize) {
            applyFontSizeToSelection(fontSize);
        }
    });

    document.getElementById('fontSelect').addEventListener('change', function () {
        const fontName = this.value;
        if (fontName) {
            applyFontToSelection(fontName);
        }
    });

    document.getElementById('colorPicker').addEventListener('change', function () {
        applyToSelection('foreColor', this.value);
    });

    document.getElementById('fileInput').addEventListener('change', function () {
        loadDocument(this.files[0]);
    });

    document.getElementById('imageInput').addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                insertImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    document.querySelector('button[data-command="bold"]').addEventListener('click', () => applyToSelection('bold'));
    document.querySelector('button[data-command="italic"]').addEventListener('click', () => applyToSelection('italic'));
    document.querySelector('button[data-command="underline"]').addEventListener('click', () => applyToSelection('underline'));
    document.querySelector('button[data-command="justifyLeft"]').addEventListener('click', () => applyToSelection('justifyLeft'));
    document.querySelector('button[data-command="justifyCenter"]').addEventListener('click', () => applyToSelection('justifyCenter'));
    document.querySelector('button[data-command="justifyRight"]').addEventListener('click', () => applyToSelection('justifyRight'));
    document.querySelector('button[data-command="insertUnorderedList"]').addEventListener('click', () => applyToSelection('insertUnorderedList'));
    document.querySelector('button[data-command="insertOrderedList"]').addEventListener('click', () => applyToSelection('insertOrderedList'));
});

function applyToSelection(command, value = null) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');

        switch (command) {
            case 'fontName':
                span.style.fontFamily = value;
                break;
            case 'fontSize':
                span.style.fontSize = value + 'px';
                break;
            case 'foreColor':
                span.style.color = value;
                break;
            case 'bold':
                span.style.fontWeight = 'bold';
                break;
            case 'italic':
                span.style.fontStyle = 'italic';
                break;
            case 'underline':
                span.style.textDecoration = 'underline';
                break;
            case 'justifyLeft':
            case 'justifyCenter':
            case 'justifyRight':
                span.style.display = 'block';
                span.style.textAlign = command.replace('justify', '').toLowerCase();
                break;
            case 'insertUnorderedList':
            case 'insertOrderedList':
                const list = document.createElement(command === 'insertUnorderedList' ? 'ul' : 'ol');
                const li = document.createElement('li');
                li.appendChild(range.extractContents());
                list.appendChild(li);
                range.insertNode(list);
                return;
        }

        span.appendChild(range.extractContents());
        range.insertNode(span);
        selection.removeAllRanges();
    }
}

function applyFontToSelection(fontName) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');

        span.style.fontFamily = fontName;
        span.appendChild(range.extractContents());
        range.insertNode(span);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function applyFontSizeToSelection(fontSize) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');

        span.style.fontSize = fontSize + 'px';
        span.appendChild(range.extractContents());
        range.insertNode(span);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function insertImage(src) {
    const container = document.createElement('div');
    container.classList.add('resizable', 'draggable');
    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    container.appendChild(img);

    const handle = document.createElement('div');
    handle.classList.add('resize-handle', 'br');
    container.appendChild(handle);

    insertNodeAtCaret(container);

    addResizeListeners(container, handle);
    addDragListeners(container);
}

function addResizeListeners(container, handle) {
    let startX, startY, startWidth, startHeight;

    function onMouseMove(e) {
        const newWidth = startWidth + (e.clientX - startX);
        const newHeight = startHeight + (e.clientY - startY);
        container.style.width = `${newWidth}px`;
        container.style.height = `${newHeight}px`;
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    handle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        const rect = container.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

function addDragListeners(container) {
    let startX, startY, startLeft, startTop;

    function onMouseMove(e) {
        container.style.left = `${startLeft + (e.clientX - startX)}px`;
        container.style.top = `${startTop + (e.clientY - startY)}px`;
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    container.addEventListener('mousedown', function (e) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        const rect = container.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

function insertTable() {
    const rows = prompt('請輸入列數:', '3');
    const cols = prompt('請輸入欄數:', '3');
    if (rows && cols) {
        const table = document.createElement('table');
        table.border = '1';
        for (let i = 0; i < rows; i++) {
            const tr = table.insertRow();
            for (let j = 0; j < cols; j++) {
                const td = tr.insertCell();
                td.textContent = '內容';
            }
        }
        insertNodeAtCaret(table);
    }
}

function insertNodeAtCaret(node) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(node);
    }
}

function newDocument() {
    if (confirm('確定要新建文件嗎？現有內容將被清除。')) {
        document.getElementById('editor').innerHTML = '';
    }
}

function saveDocument() {
    const content = document.getElementById('editor').innerHTML;
    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "document.html";
    a.click();
}

function loadDocument(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('editor').innerHTML = e.target.result;
        };
        reader.readAsText(file);
    }
}
