import { MongoClient, ObjectId } from "mongodb";

let db;
const uri = process.env.MONGODB_URI;

async function connectDB() {
  if (db) return db;
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db("todoApp");
  return db;
}

export async function POST(req) {
  const { task } = await req.json();
  if (!task) {
    return new Response(
      JSON.stringify({ success: false, message: "Task is required" }),
      { status: 400 }
    );
  }
  const tasksCollection = await (await connectDB()).collection("tasks");
  await tasksCollection.insertOne({ task, completed: false });
  return new Response(
    JSON.stringify({
      success: true,
      message: `Task "${task}" added successfully`,
    }),
    { status: 200 }
  );
}

export async function GET() {
  const tasksCollection = await (await connectDB()).collection("tasks");
  const tasks = await tasksCollection.find().toArray();
  return new Response(JSON.stringify({ success: true, tasks }), {
    status: 200,
  });
}

export async function DELETE(req) {
  const { id } = await req.json();
  if (!id) {
    return new Response(
      JSON.stringify({ success: false, message: "ID is required" }),
      { status: 400 }
    );
  }
  const tasksCollection = await (await connectDB()).collection("tasks");
  const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    return new Response(
      JSON.stringify({ success: false, message: "Task not found" }),
      { status: 404 }
    );
  }
  return new Response(
    JSON.stringify({ success: true, message: "Task deleted successfully" }),
    { status: 200 }
  );
}
