let ApiKey = "e3b3095tf9493f408498of3c2e1c6a18";

let chatBox = document.getElementById("chat-box");
let userInput = document.getElementById("userInput");

let savedHistory = localStorage.getItem("wellness_history");
let chatHistory = [];

if (savedHistory) {
    chatHistory = JSON.parse(savedHistory);
} else {
    chatHistory = [];
}

renderChat();

function sendMessage() {
    let text = userInput.value.trim();
    if (text === "") return;

    let userMsg = {
        sender: "user",
        text: text,
        timestamp: Date.now()
    };

    chatHistory.push(userMsg);
    saveHistory();
    renderChat();
    userInput.value = "";

    callAI(text);
}
async function callAI(message) {
    addTypingIndicator();

    try {
        let prompt = encodeURIComponent(message);
        let context = encodeURIComponent("You are a compassionate, supportive mental wellness assistant. Reply empathetically and concisely.");

        let Url = `https://api.shecodes.io/ai/v1/generate?prompt=${prompt}&context=${context}&key=${ApiKey}`;

        let response = await fetch(Url);
        let data = await response.json();

        removeTypingIndicator();

        let aiText = data.answer ? data.answer : "I'm here for you. Tell me more.";

        let aiMsg = {
            sender: "ai",
            text: aiText,
            timestamp: Date.now()
        };

        chatHistory.push(aiMsg);
        saveHistory();
        renderChat();

    } catch (error) {
        removeTypingIndicator();

        let aiError = {
            sender: "ai",
            text: "I'm having trouble connecting right now, but I'm still here for you.",
            timestamp: Date.now()
        };

        chatHistory.push(aiError);
        saveHistory();
        renderChat();
    }
}

async function generateWeeklySummary() {

    if (chatHistory.length === 0) {
        alert("No messages yet for a weekly summary.");
        return;
    }

    let last7 = chatHistory
        .filter(msg => Date.now() - msg.timestamp < 7 * 24 * 60 * 60 * 1000)
        .map(msg => (msg.sender === "user" ? "User: " : "AI: ") + msg.text)
        .join("\n");

    let prompt = encodeURIComponent("Create a warm, supportive weekly mental wellness reflection summary based on this conversation:\n\n" + last7);

    let context = encodeURIComponent("You generate empathetic emotional summaries and help users reflect gently.");

    let Url = `https://api.shecodes.io/ai/v1/generate?prompt=${prompt}&context=${context}&key=${ApiKey}`;

    try {
        let response = await fetch(Url);
        let data = await response.json();

        let summaryText = data.answer ? data.answer : "I'm here for you.";

        let aiMsg = {
            sender: "ai",
            text: summaryText,
            timestamp: Date.now()
        };

        chatHistory.push(aiMsg);
        saveHistory();
        renderChat();

    } catch (error) {
        let aiError = {
            sender: "ai",
            text: "I'm having trouble generating your weekly summary right now.",
            timestamp: Date.now()
        };

        chatHistory.push(aiError);
        saveHistory();
        renderChat();
    }
}

function renderChat() {
    chatBox.innerHTML = "";

    for (let msg of chatHistory) {
        let bubble = document.createElement("div");
        bubble.className = "message " + (msg.sender === "user" ? "user" : "ai");
        bubble.innerText = msg.text;
        chatBox.appendChild(bubble);
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}


function saveHistory() {
    localStorage.setItem("wellness_history", JSON.stringify(chatHistory));
}

function addTypingIndicator() {
    let div = document.createElement("div");
    div.id = "typing";
    div.className = "message ai";
    div.innerText = "MindEase is thinking...";
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
    let typing = document.getElementById("typing");
    if (typing) typing.remove();
}
