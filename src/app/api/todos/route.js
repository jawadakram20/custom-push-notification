import { broadcastToClients } from "../../../../server";

export async function POST(req) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = {
        success: true,
        message: "Task received successfully",
      };

      broadcastToClients(response.message);

      resolve(new Response(JSON.stringify(response), { status: 200 }));
    }, 5000);
  });
}
