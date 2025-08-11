// MAX MEMORY USAGE DURING TESTS: 177MB
import fs from "fs";
import { generateFakeNumber, generateFakeSalary } from "../utils/fake.js";

const NUMBER_OF_REGISTERS = 1000000;

function logMemoryUsage(label) {
  const mem = process.memoryUsage();
  // heapUsed é a memória usada pelo JavaScript (pilha e heap)
  console.log(`[${label}] Memory used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
}

async function createFakeTransfersFile() {
  logMemoryUsage("Inicio createFakeTransfersFile");

  const headers = ["document", "agency", "account", "value"];
  const writable = fs.createWriteStream("transfers.csv");
  writable.write(headers.join(",") + "\n");

  for (let i = 0; i < NUMBER_OF_REGISTERS; i++) {
    const fakeDocument = generateFakeNumber(8);
    const fakeAgency = generateFakeNumber(4);
    const fakeAccount = generateFakeNumber(6);
    const value = generateFakeSalary();
    writable.write([fakeDocument, fakeAgency, fakeAccount, value].join(",").concat("\n"));

    if (i > 0 && i % 5000 === 0) {
      logMemoryUsage(`Loop no registro #${i}`);
    }
  }

  writable.end();

  logMemoryUsage("Fim createFakeTransfersFile");
}

async function main() {
  logMemoryUsage("Inicio da main");
  await createFakeTransfersFile();
  logMemoryUsage("Fim da main");
}

main();
