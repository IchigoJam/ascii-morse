import { CSV } from "https://js.sabae.cc/CSV.js";

const csv = CSV.decode(Deno.readTextFileSync("ascii-morse.csv"));
Deno.writeTextFileSync("ascii-morse.json", JSON.stringify(CSV.toJSON(csv), null, 2));
