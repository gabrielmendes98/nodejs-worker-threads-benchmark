import { parentPort } from "worker_threads";
import { validateAccount, validateAgency, validateDocument, validateValue } from "../utils/validations.js";

function validateLines(lines, firstLine) {
  const errorMessages = [];
  for (const [index, line] of lines.entries()) {
    const [document, agency, account, value] = line.split(",");
    const isDocumentValid = validateDocument(document);
    const isAgencyValid = validateAgency(agency);
    const isAccountValid = validateAccount(account);
    const isValueValid = validateValue(value);
    const errorLine = index + firstLine;
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

parentPort.on("message", (message) => {
  const { lines, firstLine } = message;
  const errors = validateLines(lines, firstLine);
  parentPort.postMessage({ errors });
});
