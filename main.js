//#region Variables
/** @type {HTMLCanvasElement} */
const c = document.getElementById("canvas");
const ctx = c.getContext("2d");

let cWidth = 800;
let cHeight = 600;
let fontSize = 24;
let margin = 50;
let scrollOffset = 0;
let lineHeight = 27;
let maxScroll = 22;
let scroll = maxScroll;
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
//#endregion

//#region Events
document.addEventListener("keydown", (e) => {
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
            } else if (e.code == "Enter") {
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
    ctx.fillStyle = color.background;
    ctx.fillRect(0, 0, cWidth, cHeight);
    ctx.fillStyle = color.background_secondary;
    ctx.fillRect(margin, ((lineHeight*(ln))+7)+scrollOffset, cWidth-margin, lineHeight);
    
    for (let i = 0; i < lines.length; i++) {
        DrawText(" ".repeat(3-(i+1).toString().length) + (i+1).toString(), 0, scrollOffset+(lineHeight*(i+1)), fontSize, ln == i ? color.secondary : color.primary);
        DrawText(lines[i], margin, scrollOffset+(lineHeight*(i+1)), fontSize, color.primary);
    }

    DrawText(" ".repeat(scrub) + "|", margin-(ctx.measureText(" ").width/2), scrollOffset+(lineHeight*(ln+1)), fontSize, color.highlight);
}

function ApplyScroll() {
    if (ln >= scroll-1) {
        scrollOffset -= lineHeight;
        scroll++;
    } else if (ln < scroll-maxScroll && scroll != maxScroll) {
        scrollOffset += lineHeight;
        scroll--;
    }
}

// Import
document.getElementById("import").addEventListener("change", (e) => {
    console.log("importing...");
});

// Export
document.getElementById("export").addEventListener("change", (e) => {
    console.log("exporting...");
});

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
