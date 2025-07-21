import React from "react";
import Header from "./components/Header";
import "./App.css";
import HomePage from "./components/HomePage";

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="content">
        <HomePage />
      </main>
    </div>
  );
}

export default App;
