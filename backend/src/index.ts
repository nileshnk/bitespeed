import express, { Request, Response } from "express";
import { UserIdentify } from "./controller/user-identify";
const app = express();
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello from BiteSpeed!🚀");
});

app.post("/identify", UserIdentify);

const PORT = Number(process.env.APP_PORT) || 4000;
const HOST = process.env.APP_HOST || "127.0.0.1";
app.listen(PORT, HOST, () => {
  console.log("Server is listening on port", PORT);
});
