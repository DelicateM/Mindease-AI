let ApiKey = "e3b3095tf9493f408498of3c2e1c6a18";
let ApiUrl = "https://api.shecodes.io/ai/v1/generate";
let chatBox = document.getElementById("chat-box");
let userInput = document.getElementById("userInput");

let savedHistory = localStorage.getItem("wellness_history");
let chatHistory =[];
if (savedHistory){
    chatHistory = JSON.parse(savedHistory);
}
else {
    chatHistory = [];
}
renderChat();
function sendMessage (){
    let text = userInput.value.trim();
    if (text === "") return;
    let userMsg = { sender: "user", text: text, timestamp:Date.now()};
    chatHistory.push(userMsg);
    saveHistory();
    renderChat();
    userInput.value = "";
    callAI(text);
}
async function callAI(message) {
    addTypingIndicator();
    try{
        let response = await fetch(ApiUrl, {
           method: "POST",
           headers: {
            "Content-Type": "application/json"
           },
           body: JSON.stringify({
            key: ApiKey,
            message: [ {role: "system", content: "You are a friendly mental wellness assistant."},
                {role: "user", content: message}
            ]
           })
    });
    let data = await response.json();
    removeTypingIndicator();
    let aiText;
    if (data.answer){
        aiText = data.answer;
    }  
    else {
        aiText = "I'm here for you. Tell me more.";
    }
    let aiMsg = { sender: "ai", text: aiText, timestamp: Date.now()};
    chatHistory.push(aiMsg);
    saveHistory();
    renderChat();
}
catch (error){
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
function addTypingIndicator(){
    let div = document.createElement("div");
    div.id = "typing";
    div.className = "message ai";
    div.innerText = "MindEase is thinking...";
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}
function removeTypingIndicator (){
    let typing = document.getElementById ("typing");
    if (typing) typing.remove();
}
function renderChat(){
    chatBox.innerHTML = "";
    for (let msg of chatHistory){
        let bubble = document.createElement("div");
        bubble.className = "message" + (msg.sender === "user" ? "user" : "ai");
        bubble.innerText = msg.text;
        chatBox.appendChild(bubble);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}
function saveHistory (){
    localStorage.setItem("wellness_history", JSON.stringify(chatHistory));
}
async function generateWeeklySummary() {
    if (chatHistory.length === 0){
        alert("No messages yet for a weekly summary.");
        return;
    }
    let last7 = chatHistory
    .filter (msg => Date.now()- msg.timestamp <7 * 24 * 60 * 1000)
    .map(msg => msg.sender.toUpperCase() + ": " + msg.text)
    .join("\n");
    let prompt = "Create a supportive weekly mental wellness reflection summary based on this conversation:\n\n" + last7;
    let response = await fetch (ApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
            key: ApiKey,
            messages: [
                {
                    role: "system", content: "You generate supportive and empathetic mental wellness summaries."
                },
                {role: "user", content: prompt}
            ]
        })
    });
    let data = await response.json();
    let summaryText;
     if (data.answer) {
        summaryText = data.answer;
     } 
     else{
        summaryText = "I'm here for you.";
     }
    let aiMsg = { sender: "ai", text: summaryText, timestamp: Date.now()};
    chatHistory.push(aiMsg);
    saveHistory();
    renderChat();
    
}
