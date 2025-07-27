import { Router } from "express";

const testRouter = Router();

// Simple test route
testRouter.get("/test-simple", (req, res) => {
  console.log("TEST SIMPLE ROUTE HIT");
  res.json({ message: "Test route working", timestamp: new Date().toISOString() });
});

// Login test route
testRouter.post("/test-login", (req, res) => {
  console.log("TEST LOGIN ROUTE HIT WITH BODY:", req.body);
  res.json({ message: "Test login working", body: req.body });
});

export default testRouter;