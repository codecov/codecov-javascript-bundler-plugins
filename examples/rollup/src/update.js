import format from "date-fns/format";

var span = document.querySelector("#time-now");
var minSpan = document.querySelector("#time-min");
var hourSpan = document.querySelector("#time-hour");

export default function update() {
  span.textContent = format(new Date(), "h:mm:ssa");
  setTimeout(update, 1000);
}

export function minUpdate() {
  minSpan.textContent = format(new Date(), "h:mm:ssa");
  setTimeout(update, 60000);
}

export function hourUpdate() {
  hourSpan.textContent = format(new Date(), "h:mm:ssa");
  setTimeout(update, 3600000);
}
