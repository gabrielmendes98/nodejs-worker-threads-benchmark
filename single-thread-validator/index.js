import fs from "fs";
import { validateAccount, validateAgency, validateDocument, validateValue } from "../utils/validations.js";

function validateLines(lines, firstLine) {
  const errorMessages = [];
  for (let index in lines) {
    const line = lines[index].split(",");
    const [document, agency, account, value] = line;
    const isDocumentValid = validateDocument(document);
    const isAgencyValid = validateAgency(agency);
    const isAccountValid = validateAccount(account);
    const isValueValid = validateValue(value);
    const errorLine = Number(index) + firstLine + 1;
    if (!isDocumentValid) {
      errorMessages.push(`Error on line ${errorLine}: invalid document [${document}].`);
    }
    if (!isAgencyValid) {
      errorMessages.push(`Error on line ${errorLine}: invalid agency [${agency}].`);
    }
    if (!isAccountValid) {
      errorMessages.push(`Error on line ${errorLine}: invalid account [${account}].`);
    }
    if (!isValueValid) {
      errorMessages.push(`Error on line ${errorLine}: invalid value [${value}].`);
    }
  }
  return errorMessages;
}

function processChunk(errorMessages) {
  let chunkNumber = 0;
  let firstLine = 1;
  let lastLineText = "";

  return function (chunk) {
    const lines = chunk.split("\n");
    if (chunkNumber === 0) {
      lines.shift();
    }
    if (lastLineText) {
      const restOfLastLine = lines.shift();
      lastLineText += restOfLastLine;

      lines.unshift(lastLineText);
      lastLineText = "";
    }

    lastLineText = lines.pop();

    const messages = validateLines(lines, firstLine);
    firstLine += lines.length;
    errorMessages.push(...messages);

    chunkNumber++;
  };
}

async function validateTransfers() {
  const errorMessages = [];

  return new Promise((resolve) => {
    const readable = fs.createReadStream("transfers.csv", { encoding: "utf-8" });
    readable.on("data", processChunk(errorMessages));
    readable.on("end", () => {
      resolve(errorMessages);
    });
  });
}

async function main() {
  console.time();
  const errorMessages = await validateTransfers();
  console.log("errors:", errorMessages);
  console.timeEnd();
}

main();
