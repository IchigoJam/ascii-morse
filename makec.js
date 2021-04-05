import { CSV } from "https://js.sabae.cc/CSV.js";

const csv = CSV.decode(Deno.readTextFileSync("ascii-morse.csv"));
const data = CSV.toJSON(csv);

let min = 255;
let max = 0;
for (const morse of data) {
    const c = morse.ascii.charCodeAt(0);
    if (c < min) {
        min = c;
    } else if (c > max) {
        max = c;
    }
}
//console.log(min, max);

const encc = c => {
    if (c == '"') {
        return "\\\"";
    } else if (c == "\\") {
        return "\\\\";
    }
    return c;
};
const asciis = [];
const codes = [];
for (let i = min; i <= max; i++) {
    const morse = data.find(d => d.ascii.charCodeAt(0) == i);
    if (!morse) {
        asciis.push("\\0");
        codes.push(0);
    } else {
        asciis.push(encc(morse.ascii));
        codes.push("0x" + morse.morse);
    }
}
//console.log(asciis.join(""));
const s = `#define ASCIIMORSE_LEN ${max - min + 1}
#define ASCIIMORSE_MIN ${min}
#define ASCIIMORSE_MAX ${max}
static const int ASCIIMORSE[] = { ${codes.join(", ")} };

int morse_encode(char c) {
    if (c >= 'a' && c <= 'z') {
        c = c - ('a' - 'A');
    }
    if (c >= ASCIIMORSE_MIN && c <= ASCIIMORSE_MAX) {
        return ASCIIMORSE[c - ASCIIMORSE_MIN];
    }
    return 0;
}

void morse_beep(int n);
void morse_wait(int n);

void morse_out(char c) {
    if (c == ' ') {
        return;
    }
    if (c == '\\n') {
        morse_wait(4);
    }
    int m = morse_encode(c);
    if (!m) {
        return;
    }
    for (int i = 7; i >= 0; i--) {
        int l = (m >> (i * 4)) & 0xf;
        if (l) {
            morse_beep(l);
            morse_wait(l + 1);
        }
    }
    morse_wait(2);
}

void morse_beep(int n) { // async
    printf("morse_beep %d\\n", n);
}
void morse_wait(int n) { // sync
    printf("morse_wait %d\\n", n);
}
`;
console.log(s);
Deno.writeTextFileSync("ascii-morse.h", s);
