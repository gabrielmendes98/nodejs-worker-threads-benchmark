// MAX MEMORY USAGE DURING TESTS: 24MB
import fs from "fs";
import { generateFakeNumber, generateFakeSalary } from "../utils/fake.js";

const NUMBER_OF_REGISTERS = 1000000;

function logMemoryUsage(label) {
  const mem = process.memoryUsage();
  // heapUsed é a memória usada pelo JavaScript (pilha e heap)
  console.log(`[${label}] Memory used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
}

async function createFakeTransfersFile() {
  logMemoryUsage("Início da createFakeTransfersFile");

  const headers = ["document", "agency", "account", "value"];
  const writable = fs.createWriteStream("../transfers.csv");
  writable.write(headers.join(",") + "\n");

  let i = 0;

  function write() {
    let ok = true;

    while (i < NUMBER_OF_REGISTERS && ok) {
      const fakeDocument = generateFakeNumber(8);
      const fakeAgency = generateFakeNumber(4);
      const fakeAccount = generateFakeNumber(6);
      const value = generateFakeSalary();
      const line = [fakeDocument, fakeAgency, fakeAccount, value].join(",").concat("\n");

      if (i === NUMBER_OF_REGISTERS - 1) {
        writable.end(line);
        return;
      }

      ok = writable.write(line);
      i++;
    }

    if (i < NUMBER_OF_REGISTERS) {
      logMemoryUsage(`Buffer cheio no registro #${i}`);
      writable.once("drain", write);
    }
  }

  write();

  return new Promise((resolve) => {
    writable.on("finish", () => {
      logMemoryUsage(`Buffer cheio no registro #${i}`);
      resolve();
    });
  });
}

async function main() {
  logMemoryUsage("Inicio da main");
  await createFakeTransfersFile();
  logMemoryUsage("Fim da main");
}

main();
