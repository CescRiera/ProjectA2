import SampleData from "./services/sample-data.js"
import App from "./app.js"

async function initializeApp() {
  try {
    await SampleData.initialize()
    App.init()
  } catch (error) {}
}

document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

if (document.readyState !== "loading") {
  initializeApp()
}

