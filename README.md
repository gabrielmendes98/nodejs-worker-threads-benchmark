# Node.js Worker Threads Benchmark

This repository demonstrates how to effectively use **Worker Threads** and **Streams** in Node.js. Although Node.js is primarily known for its single-threaded nature, this project proves that we can leverage multiple threads for computationally intensive tasks.

The benchmark reveals an interesting insight: for a small amount of data, processing with a single thread is **faster** than using multiple threads. This is due to the overhead of spawning and managing threads. However, as the data volume grows, multi-threading offers significant performance gains. This behavior is a direct result of how Node.js's event loop and Libuv handle I/O operations.

I manually generated the test file. You can find the generation process inside the `file-generator` folder, where I implemented two different methods: one that waits for the write stream to be drained (optimizing memory usage) and another that does not (which could lead to memory overflow).

The project uses a simple validation process on a few columns of the generated data. This experiment successfully showcases how to use streams and multi-threading in Node.js to process large files efficiently. It also serves as a great example of why multi-threading isn't always the best choice, especially for I/O-bound tasks with small datasets.

In the future, I plan to run the same benchmark on the same machine using Java, to provide a direct performance comparison between the two platforms.

## Tests on a MacBook with 11 Cores

|                      | Single Thread | Multi Thread |
| :------------------- | :-----------: | :----------: |
| 10 Thousand Records  |     8.8ms     |    29.8ms    |
| 100 Thousand Records |    30.7ms     |    41.2ms    |
| 1 Million Records    |    229.2ms    |   106.7ms    |
| 10 Million Records   |    2241ms     |    688ms     |
| 100 Million Records  |    23146ms    |    6390ms    |
