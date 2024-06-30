import express, { Request, Response } from "express";
const app = express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello from BiteSpeed!🚀");
});

const PORT = 4000;

app.listen(PORT, "127.0.0.1", () => {
  console.log("Server is listening on port", PORT);
});
