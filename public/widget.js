(function () {
  // 1. Find the script tag that loaded this widget to get the tenantId
  const scripts = document.getElementsByTagName("script");
  let tenantId = null;
  let hostUrl = "http://localhost:3000"; // Fallback host
  
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src.includes("widget.js")) {
      tenantId = scripts[i].getAttribute("data-tenant-id");
      const url = new URL(scripts[i].src);
      hostUrl = url.origin;
      break;
    }
  }

  if (!tenantId) {
    console.error("Chatbot Widget: Missing data-tenant-id attribute on the script tag.");
    return;
  }

  // 2. State & Variables
  let isOpen = false;
  let botConfig = {
    name: "Assistant",
    colorScheme: "#3b82f6",
    welcomeMessage: "Hi there! How can I help you?",
  };
  let messages = [];

  // Load marked.js dynamically for Markdown parsing
  const markedScript = document.createElement("script");
  markedScript.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
  document.head.appendChild(markedScript);

  // 3. Setup UI Elements
  const container = document.createElement("div");
  container.id = "chatbot-factory-widget-container";
  document.body.appendChild(container);

  // Inject Styles
  const style = document.createElement("style");
  style.innerHTML = `
    #chatbot-factory-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .cf-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: var(--cf-primary, #3b82f6);
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    .cf-widget-button:hover {
      transform: scale(1.05);
    }
    .cf-widget-button svg {
      width: 30px;
      height: 30px;
      fill: currentColor;
    }
    .cf-widget-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .cf-widget-window.cf-open {
      display: flex;
    }
    .cf-widget-header {
      background-color: var(--cf-primary, #3b82f6);
      color: white;
      padding: 15px;
      font-weight: 600;
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cf-widget-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
    }
    .cf-widget-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background-color: #f8fafc;
    }
    .cf-message {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
    }
    .cf-message-user {
      align-self: flex-end;
      background-color: var(--cf-primary, #3b82f6);
      color: white;
      border-bottom-right-radius: 4px;
    }
    .cf-message-bot {
      align-self: flex-start;
      background-color: white;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 4px;
    }
    .cf-widget-input-area {
      padding: 15px;
      background: white;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 10px;
    }
    .cf-widget-input {
      flex: 1;
      padding: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
    }
    .cf-widget-input:focus {
      border-color: var(--cf-primary, #3b82f6);
    }
    .cf-widget-send {
      background-color: var(--cf-primary, #3b82f6);
      color: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cf-widget-send svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
  `;
  document.head.appendChild(style);

  // Render HTML structure
  container.innerHTML = `
    <div class="cf-widget-window" id="cf-window">
      <div class="cf-widget-header" id="cf-header">
        <span id="cf-bot-name">Support Assistant</span>
        <button class="cf-widget-close" id="cf-close-btn">&times;</button>
      </div>
      <div class="cf-widget-messages" id="cf-messages">
        <!-- Messages go here -->
      </div>
      <form class="cf-widget-input-area" id="cf-form">
        <input type="text" class="cf-widget-input" id="cf-input" placeholder="Type a message..." autocomplete="off" />
        <button type="submit" class="cf-widget-send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </form>
    </div>
    <button class="cf-widget-button" id="cf-toggle-btn">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
    </button>
  `;

  // DOM Elements
  const windowEl = document.getElementById("cf-window");
  const toggleBtn = document.getElementById("cf-toggle-btn");
  const closeBtn = document.getElementById("cf-close-btn");
  const formEl = document.getElementById("cf-form");
  const inputEl = document.getElementById("cf-input");
  const messagesEl = document.getElementById("cf-messages");
  const headerEl = document.getElementById("cf-header");
  const botNameEl = document.getElementById("cf-bot-name");

  // 4. Fetch Bot Config
  async function loadConfig() {
    try {
      const res = await fetch(`${hostUrl}/api/bot/public?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.bot) {
          botConfig = data.bot;
          container.style.setProperty("--cf-primary", botConfig.colorScheme);
          botNameEl.innerText = botConfig.name;
          
          if (botConfig.avatarUrl) {
            const img = document.createElement("img");
            img.src = botConfig.avatarUrl;
            img.style.width = "30px";
            img.style.height = "30px";
            img.style.borderRadius = "50%";
            img.style.objectFit = "cover";
            img.style.marginRight = "10px";
            headerEl.insertBefore(img, botNameEl);
          }

          addMessage(botConfig.welcomeMessage, "assistant");
        }
      }
    } catch (e) {
      console.error("Failed to load bot config:", e);
      addMessage("Hi! How can I help?", "assistant");
    }
  }

  // 5. Functions
  function toggleWindow() {
    isOpen = !isOpen;
    if (isOpen) {
      windowEl.classList.add("cf-open");
      toggleBtn.style.display = "none";
      if (messages.length === 0) {
        loadConfig();
      }
    } else {
      windowEl.classList.remove("cf-open");
      toggleBtn.style.display = "flex";
    }
  }

  function addMessage(content, role) {
    messages.push({ role, content });
    renderMessage(content, role);
  }

  function renderMessage(content, role, id = null) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "8px";
    wrapper.style.alignItems = "flex-end";
    wrapper.style.alignSelf = role === 'assistant' ? 'flex-start' : 'flex-end';
    wrapper.style.maxWidth = "90%";

    if (role === 'assistant' && botConfig.avatarUrl) {
      const avatar = document.createElement("img");
      avatar.src = botConfig.avatarUrl;
      avatar.style.width = "20px";
      avatar.style.height = "20px";
      avatar.style.borderRadius = "50%";
      avatar.style.objectFit = "cover";
      avatar.style.flexShrink = "0";
      wrapper.appendChild(avatar);
    }

    const el = document.createElement("div");
    el.className = `cf-message cf-message-${role === 'assistant' ? 'bot' : role}`;
    if (id) el.id = id;
    
    // Check if marked is loaded for Markdown parsing
    if (typeof window.marked !== 'undefined') {
      // Use marked to parse Markdown into HTML
      el.innerHTML = window.marked.parse(content);
      
      // Fix margins for p tags inside the message
      const pTags = el.querySelectorAll('p');
      pTags.forEach(p => { p.style.margin = '0 0 10px 0'; });
      if (pTags.length > 0) pTags[pTags.length - 1].style.margin = '0';
    } else {
      el.innerText = content;
    }
    
    // Reset alignSelf on el since wrapper handles it
    el.style.alignSelf = "auto";
    
    wrapper.appendChild(el);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  async function sendMessage(e) {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = "";
    addMessage(text, "user");

    // Add empty bot message for streaming
    const msgId = "cf-msg-" + Date.now();
    const botMsgEl = renderMessage("...", "assistant", msgId);

    // Get or create session ID
    let sessionId = localStorage.getItem("cf-session-id-" + tenantId);
    if (!sessionId) {
      sessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("cf-session-id-" + tenantId, sessionId);
    }

    try {
      // Only send user and assistant messages to the API (exclude the welcome message)
      const chatHistory = messages.filter(m => m.role === 'user' || m.role === 'assistant').filter(m => m.content && m.content.trim() !== '');
      const res = await fetch(`${hostUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          sessionId,
          messages: chatHistory,
        }),
      });

      if (!res.ok) throw new Error("Network error");

      // Read the Vercel AI SDK stream (Text/Event stream)
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = "";

      botMsgEl.innerText = ""; // Clear "..."

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkString = decoder.decode(value, { stream: true });
          fullResponse += chunkString;
          
          if (typeof window.marked !== 'undefined') {
            botMsgEl.innerHTML = window.marked.parse(fullResponse);
            // Fix margins
            const pTags = botMsgEl.querySelectorAll('p');
            pTags.forEach(p => { p.style.margin = '0 0 10px 0'; });
            if (pTags.length > 0) pTags[pTags.length - 1].style.margin = '0';
          } else {
            botMsgEl.innerText = fullResponse;
          }
          
          messagesEl.scrollTop = messagesEl.scrollHeight;
        }
      }

      // Update history state
      messages.push({ role: "assistant", content: fullResponse });

    } catch (error) {
      console.error(error);
      botMsgEl.innerText = "Sorry, I am having trouble connecting right now.";
    }
  }

  // Event Listeners
  toggleBtn.addEventListener("click", toggleWindow);
  closeBtn.addEventListener("click", toggleWindow);
  formEl.addEventListener("submit", sendMessage);

})();
