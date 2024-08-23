import _ from "lodash";
import { getRandomNumber } from "./getRandomNumber.js";

const randomNumber = getRandomNumber(1, 10);

const output = `Is ${randomNumber} between 0 and 5: ${_.inRange(
  randomNumber,
  0,
  5,
)}`;

console.log(output);
