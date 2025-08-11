import fs from "fs";
import os from "os";
import path from "path";
import { Worker } from "worker_threads";

const __dirname = import.meta.dirname;

const NUM_WORKERS = os.cpus().length;
const BATCH_SIZE = 1000;

// 'allWorkers' mantém a referência a todas as threads, para encerramento
const allWorkers = [];
// 'availableWorkers' gerencia quais workers podem receber novas tarefas
const availableWorkers = [];
const taskQueue = [];

let tasksSent = 0;
let tasksCompleted = 0;
let readingFinished = false;

async function validateTransfers() {
  const allErrors = [];

  return new Promise((resolve, reject) => {
    function createWorker() {
      const worker = new Worker(path.join(__dirname, "worker.js"));
      allWorkers.push(worker);
      availableWorkers.push(worker);

      worker.on("message", ({ errors }) => {
        allErrors.push(...errors);
        tasksCompleted++;

        // Se houver mais tarefas na fila, distribua para este worker
        if (taskQueue.length > 0) {
          const task = taskQueue.shift();
          worker.postMessage(task);
        } else {
          // Caso contrário, adicione o worker de volta ao pool de disponíveis
          availableWorkers.push(worker);
        }

        if (readingFinished && tasksCompleted === tasksSent) {
          resolve(allErrors);
        }
      });

      worker.on("error", (err) => {
        console.error("Worker error:", err);
        reject(err);
      });
    }

    for (let i = 0; i < NUM_WORKERS; i++) {
      createWorker();
    }

    let lastLineText = "";
    let currentLineNumber = 1;
    let batch = [];

    const readable = fs.createReadStream("transfers.csv", { encoding: "utf-8" });

    readable.on("data", (chunk) => {
      const lines = (lastLineText + chunk).split("\n");
      lastLineText = lines.pop();

      if (currentLineNumber === 1) {
        lines.shift();
        currentLineNumber++;
      }

      lines.forEach((line) => {
        if (line.trim()) {
          batch.push(line);
          if (batch.length === BATCH_SIZE) {
            tasksSent++;
            const task = { lines: batch, firstLine: currentLineNumber };

            // Se houver workers disponíveis, use um
            if (availableWorkers.length > 0) {
              const worker = availableWorkers.shift();
              worker.postMessage(task);
            } else {
              // Se não houver, coloque a tarefa na fila
              taskQueue.push(task);
            }
            currentLineNumber += batch.length;
            batch = [];
          }
        }
      });
    });

    readable.on("end", () => {
      if (lastLineText.trim()) {
        batch.push(lastLineText);
      }

      if (batch.length > 0) {
        tasksSent++;
        const task = { lines: batch, firstLine: currentLineNumber };

        if (availableWorkers.length > 0) {
          const worker = availableWorkers.shift();
          worker.postMessage(task);
        } else {
          taskQueue.push(task);
        }
      }

      readingFinished = true;

      if (tasksSent === 0) {
        resolve(allErrors);
      }
    });

    readable.on("error", reject);
  }).finally(() => {
    // Agora o loop é sobre 'allWorkers', que sempre terá todos eles
    allWorkers.forEach((worker) => worker.terminate());
  });
}

async function main() {
  console.time("Tempo total");
  const errorMessages = await validateTransfers();
  console.log("Erros encontrados:", errorMessages);
  console.timeEnd("Tempo total");
}

main();
