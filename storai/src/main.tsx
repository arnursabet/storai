import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { DatabaseService } from "./infrastructure/storage/Database";
import { LlamaModel } from "./infrastructure/llm/LlamaModel";


// Initialize the database and LLM model
const initializeApp = async () => {
  try {
    console.log("Initializing database...");
    // await DatabaseService.initialize();
    
    // console.log("Checking LLM model availability...");
    // const isModelAvailable = await LlamaModel.isModelAvailable();
    
    // if (isModelAvailable) {
    //   console.log("Initializing LLM model...");
    //   await LlamaModel.initialize();
    // } else {
    //   console.warn("LLM model not found. Some features may be limited.");
    // }

    // Now render the app
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to initialize app:", error);
  }
};

// Start initialization
initializeApp();
