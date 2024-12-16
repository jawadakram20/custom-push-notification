import { MongoClient } from "mongodb";

let db;
const uri = process.env.MONGODB_URI;

async function connectDB() {
  if (db) return db;
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db("todoApp");
  return db;
}

export async function GET(req) {
  const tasksCollection = await (await connectDB()).collection("tasks");
  const changeStream = tasksCollection.watch();

  const stream = new ReadableStream({
    start(controller) {
      changeStream.on("change", (change) => {
        setTimeout(() => {
          controller.enqueue(`data: ${JSON.stringify(change)}\n\n`);
        }, 1000);
      });
    },
    cancel() {
      changeStream.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
