import express, { Request, Response } from "express";
import { UserIdentify } from "./controller/user-identify";
const app = express();
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello from BiteSpeed!🚀");
});

app.post("/identify", UserIdentify);

const PORT = 4000;

app.listen(PORT, "127.0.0.1", () => {
  console.log("Server is listening on port", PORT);
});
