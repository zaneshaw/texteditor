//#region Variables
/** @type {HTMLCanvasElement} */
const c = document.getElementById("canvas");
const ctx = c.getContext("2d");

let cWidth = 800;
let cHeight = 600;
let fontSize = 24;
let lineHeight = 27;
let textOffset = 50;
let maxLines = 999;
let maxScrollX = 52;
let maxScrollY = 22;
let caretBlinkRate = 530;
let color = {
    primary: "#ffce96",
    secondary: "#f1f2da",
    highlight: "#ff7777",
    background: "#00303b",
    background_secondary: "#003845"
}

var lines = [
    "Try typing something!",
    "1234",
    "abcd"
]
var ln = 0;
var scrub = 0;
var scrollX = 0;
var scrollY = maxScrollY;
var caretVisible;
//#endregion

//#region Events
document.addEventListener("keydown", (e) => {
    ResetCaretBlink();
    switch (e.key) {
        case "ArrowLeft":
            scrub--;
            break;
        case "ArrowRight":
            scrub++;
            break;
        case "ArrowUp":
            ln--;
            break;
        case "ArrowDown":
            ln++;
            break;
        default:
            if (e.metaKey || e.altKey || e.location != 0)
                break;

            if (e.code == "Space") {
                lines[ln] = lines[ln].slice(0, scrub) + " " + lines[ln].slice(scrub);
                scrub++;
            } else if (e.code == "Backspace") {
                if (scrub == 0 && ln != 0) {
                    scrub = lines[ln-1].length;
                    lines[ln-1] = lines[ln-1] + lines[ln];
                    lines.splice(ln, 1);
                    ln--;
                } else if (scrub != 0) {
                    lines[ln] = lines[ln].removeCharAt(scrub);
                    scrub--;
                }
            } else if (e.code == "Delete") {
                if (scrub == lines[ln].length && ln != lines.length-1) {
                    lines[ln] = lines[ln] + lines[ln+1];
                    lines.splice(ln+1, 1);
                } else {
                    lines[ln] = lines[ln].removeCharAt(scrub+1);
                }
            } else if (e.code == "Enter" && lines.length < maxLines) {
                var str = lines[ln];
                lines.splice(ln, 1);
                lines.splice(ln, 0, str.substring(0, scrub), str.substring(scrub));
                ln++;
                scrub = 0;
            } else if (e.key == "Tab") {
                e.preventDefault();
                lines[ln] = lines[ln].slice(0, scrub) + "    " + lines[ln].slice(scrub);
                scrub += 4;
            } else if (e.key.length == 1) {
                lines[ln] = lines[ln].slice(0, scrub) + e.key + lines[ln].slice(scrub);
                scrub += 1;
            }
            break;
    }
    ln = Clamp(ln, 0, lines.length-1);
    scrub = Clamp(scrub, 0, lines[ln].length);
    ApplyScroll();
});

document.getElementById("col-primary").addEventListener("input", () => {
    color.primary = document.getElementById("col-primary").value;
});
document.getElementById("col-secondary").addEventListener("input", () => {
    color.secondary = document.getElementById("col-secondary").value;
});
document.getElementById("col-highlight").addEventListener("input", () => {
    color.highlight = document.getElementById("col-highlight").value;
});
document.getElementById("col-background").addEventListener("input", () => {
    color.background = document.getElementById("col-background").value;
});
document.getElementById("col-background_secondary").addEventListener("input", () => {
    color.background_secondary = document.getElementById("col-background_secondary").value;
});
//#endregion

//#region Functions
function Init() {
    c.width = cWidth;
    c.height = cHeight;
    setInterval(() => {
        Draw();
    }, 10);
}

function Draw() {
    var appliedScrollY = -((scrollY-22)*lineHeight);
    var appliedScrollX = -(scrollX*ctx.measureText(" ").width)+textOffset;

    ctx.fillStyle = color.background;
    ctx.fillRect(0, 0, cWidth, cHeight);
    ctx.fillStyle = color.background_secondary;
    ctx.fillRect(scrollY, ((lineHeight*(ln))+7)+appliedScrollY, cWidth-scrollY, lineHeight);

    for (let i = 0; i < lines.length; i++) {
        DrawText(lines[i], appliedScrollX, appliedScrollY+(lineHeight*(i+1)), fontSize, color.primary);
        ctx.fillStyle = color.background;
        ctx.fillRect(0, ((lineHeight*(i))+7)+appliedScrollY, 50, lineHeight);
        DrawText(" ".repeat(3-(i+1).toString().length) + (i+1).toString(), 0, appliedScrollY+(lineHeight*(i+1)), fontSize, ln == i ? color.secondary : color.primary);
    }

    if (caretVisible)
        DrawText(" ".repeat(scrub) + "|", appliedScrollX-(ctx.measureText(" ").width/2), appliedScrollY+(lineHeight*(ln+1)), fontSize, color.highlight);
}

function ApplyScroll() {
    if (ln >= scrollY-1) {
        scrollY++;
    } else if (ln < scrollY-maxScrollY && scrollY != maxScrollY) {
        scrollY--;
    }
    
    if (scrub >= maxScrollX+(scrollX)) {
        scrollX++;
    } else if (scrub <= scrollX && scrollX > 0) {
        scrollX--;
    }
}

var caretBlink = setInterval(() => {
    caretVisible = !caretVisible;
}, caretBlinkRate);

function ResetCaretBlink() { // Cry :D
    caretVisible = true;
    clearInterval(caretBlink);
    caretBlink = setInterval(() => {
        caretVisible = !caretVisible;
    }, caretBlinkRate);
}

// Import
document.getElementById("import").onchange = (e) => {
    var reader = new FileReader();
    reader.onload = function(e) {
        var output = e.target.result;
        
        lines = output.split("\n");

        ln = 0;
        scrub = 0;
        scroll = maxScroll;
        ApplyScroll();
    }
    reader.readAsText(e.target.files[0]);

    document.getElementById("import").value = null;
}

// Export
document.getElementById("export").onclick = () => {
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([lines.join("\n")], {type: "text/plain"}));
    a.download = "export.txt";
    a.click();
}

//#endregion

//#region Util
function DrawText(str, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.font = `${size}px monospace`;
    var text = ctx.fillText(str, x, y);
    let metrics = ctx.measureText(text);
    let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

    return {
        height: fontHeight,
        width: metrics.width
    }
}

function Clamp(n, min, max) {
    if (n > max) {
        return max;
    } else if (n < min) {
      return min
    } else {
        return n;
    }
}

// JKirchartz - https://stackoverflow.com/questions/9932957/how-can-i-remove-a-character-from-a-string-using-javascript
String.prototype.removeCharAt = function(i) {
    var tmp = this.split('');
    tmp.splice(i - 1 , 1);
    return tmp.join('');
}
//#endregion

Init();
