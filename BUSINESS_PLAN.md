# Web Design + Chatbot Services Business Plan

## 1. SERVICE PACKAGES & PRICING

### Package 1: Simple Website ($1,500 - $2,000)
- New clean, modern website OR basic redesign
- 3-5 pages (Home, About, Services, Contact, etc.)
- Mobile responsive
- Basic SEO (meta tags, sitemap)
- No chatbot included
- **Retainer:** $150/month (updates, hosting, analytics)

### Package 2: Advanced Website with Animations ($3,000 - $4,500)
- Custom design with animations and transitions
- 5-8 pages with interactive elements
- Custom brand implementation
- Performance optimization
- Advanced animations (scroll effects, hover states, parallax)
- No chatbot included
- **Retainer:** $250/month (updates, hosting, maintenance)

### Package 3: Website Development Only ($1,000 - $2,500)
- Client provides design (Figma, mockup, etc.)
- You code it to life
- Responsive, clean code
- Deployment to hosting
- **Retainer:** $100/month (updates, maintenance)

### Package 4: AI Chatbot for Website ($2,000 - $3,000 project)
- Navigation/help chatbot trained on their website
- Deployed on their site (no code changes needed from them)
- Answers FAQs, guides users through site
- Custom styling to match brand
- **Retainer:** $300-500/month (hosting, updates, retraining on new content)

### Combo Packages (What You'll Actually Sell Most)
- **Starter:** Simple Site + Chatbot = $3,500-4,500 + $350/mo retainer
- **Pro:** Advanced Site + Chatbot = $5,500-7,500 + $550/mo retainer

---

## 2. CHATBOT LEARNING PATH (Weeks 1-4)

### Week 1: Foundation (14 hours)
**Goal:** Understand how chatbots work and build your first basic one

**Learn:**
- What Claude API is and how to use it
- REST API basics (you send text → get text back)
- Basic prompt engineering (how to tell Claude what to do)

**Do:**
1. Get Claude API key from `console.anthropic.com`
2. Follow tutorial: https://github.com/anthropics/anthropic-sdk-python
3. Build a simple chatbot in Python that:
   - Takes user input
   - Sends it to Claude
   - Returns Claude's response
   - Runs in terminal

**Code Example:**
```python
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")

def chat_with_claude(user_message):
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )
    return message.content[0].text

# Test it
response = chat_with_claude("Hello! What's your name?")
print(response)
```

**Time:** 4 hours learning + 10 hours building/testing

---

### Week 2: Website Training Data (14 hours)
**Goal:** Learn how to feed a website's content into Claude so the chatbot knows about THEIR site

**Learn:**
- How to scrape/extract website content
- How to prepare data for Claude (context window, chunking)
- Prompt engineering for "answer questions about this website"

**Do:**
1. Learn web scraping (use Python + BeautifulSoup or simple requests)
2. Extract content from a website (text, FAQs, product descriptions)
3. Create a system prompt that tells Claude: "You are a helpful assistant for [Company Name]. Here's info about the site: [CONTENT]. Answer questions based ONLY on this."
4. Build chatbot that uses this info

**Code Example:**
```python
import anthropic
import requests
from bs4 import BeautifulSoup

# Step 1: Scrape website content
def scrape_website(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Get all text
    text = soup.get_text(separator='\n')
    return text

# Step 2: Create chatbot with website context
def chatbot_with_context(user_question, website_content):
    client = anthropic.Anthropic(api_key="your-api-key")
    
    system_prompt = f"""You are a helpful customer support chatbot for the website.
    Here is information about the website:
    
    {website_content}
    
    Answer questions based ONLY on the information provided above.
    Be helpful and concise."""
    
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_question}
        ]
    )
    return message.content[0].text

# Test it
website_content = scrape_website("https://example.com")
response = chatbot_with_context("How do I reset my password?", website_content)
print(response)
```

**Time:** 4 hours learning + 10 hours building/testing on real sites

---

### Week 3: Deploy to Web (14 hours)
**Goal:** Make the chatbot live on a website (not just terminal)

**Learn:**
- Basic web framework (Node.js + Express OR Python + Flask)
- HTML/CSS/JavaScript for chatbot UI
- Hosting (Vercel, Railway, or Replit)

**Simplest approach:** Use Vercel + a simple HTML/JavaScript frontend

**Do:**
1. Create a simple HTML page with a chat interface (input + messages display)
2. Create a backend API endpoint that calls Claude
3. Deploy to Vercel (free, easy)
4. Test it works on a real website

**Code Example (Node.js + Express):**
```javascript
// backend.js
import Anthropic from "@anthropic-ai/sdk";
import express from "express";

const app = express();
app.use(express.json());

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const WEBSITE_CONTENT = `
Your website info here...
About us, services, pricing, etc.
`;

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: `You are a helpful chatbot for our website. Here's our info: ${WEBSITE_CONTENT}. Answer based only on this info.`,
    messages: [{ role: "user", content: message }],
  });

  res.json({ reply: response.content[0].text });
});

app.listen(3000, () => console.log("Running on port 3000"));
```

**HTML/JavaScript for chat UI:**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .chatbot-container {
            max-width: 400px;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 15px;
            font-family: Arial, sans-serif;
        }
        .messages {
            height: 300px;
            overflow-y: auto;
            margin-bottom: 10px;
            border: 1px solid #eee;
            padding: 10px;
            border-radius: 5px;
        }
        .message {
            margin: 8px 0;
            padding: 8px;
            border-radius: 5px;
        }
        .user-message {
            background: #007bff;
            color: white;
            text-align: right;
        }
        .bot-message {
            background: #f1f1f1;
            color: black;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="chatbot-container">
        <h3>Help</h3>
        <div class="messages" id="messages"></div>
        <input id="input" placeholder="Ask me anything..." />
        <button onclick="sendMessage()">Send</button>
    </div>

    <script>
        async function sendMessage() {
            const input = document.getElementById("input");
            const message = input.value;
            if (!message) return;

            // Show user message
            document.getElementById("messages").innerHTML += 
                `<div class="message user-message">${message}</div>`;

            // Get bot response
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            const data = await response.json();

            // Show bot response
            document.getElementById("messages").innerHTML += 
                `<div class="message bot-message">${data.reply}</div>`;

            input.value = "";
        }
    </script>
</body>
</html>
```

**Time:** 4 hours learning + 10 hours building/testing

---

### Week 4: Embed on Client Sites (14 hours)
**Goal:** Learn how to actually put the chatbot on someone else's website

**This is the critical part you asked about.**

---

## 3. HOW TO ACCESS & EDIT OTHER PEOPLE'S WEBSITES (DETAILED)

### Scenario A: Client Uses WordPress
**Most common for small businesses**

**How to access:**
1. Client gives you WordPress admin login (email + password)
2. Go to `theirsite.com/wp-admin`
3. You're in. You can now edit pages, install plugins, etc.

**How to add chatbot:**
1. Install a plugin called **"Chatbot Widget"** or **"AI Chatbot"** 
2. Configure it with your chatbot API
3. Save
4. Chatbot appears on their site

**Code to add (in WordPress widget area):**
```html
<!-- Add this to WordPress theme's footer or widget area -->
<script>
  // Your chatbot embed code
  window.chatbotConfig = {
    apiEndpoint: "https://your-chatbot-api.com/api/chat",
    position: "bottom-right"
  };
</script>
<script src="https://your-chatbot-api.com/embed.js"></script>
```

**Demo: Setting up WordPress chatbot**
1. Client emails you: admin@example.com / password123
2. You go to example.com/wp-admin
3. Login
4. Go to Plugins → Add New → Search "Chatbot"
5. Click "Install" on a chatbot plugin
6. Activate it
7. Configure with your API key
8. Done. Chatbot now appears on their site.

---

### Scenario B: Client Has a Custom/HTML Website (Like Yours)
**They own the hosting, you need access to edit files**

**Option 1: They give you hosting access (cPanel or FTP)**

**What is FTP?** File Transfer Protocol - lets you upload/edit files on their web server

**How to use:**
1. Client gives you FTP login (from their hosting provider's cPanel)
2. Download FTP client (FileZilla - free)
3. Connect using: FTP address, username, password
4. Navigate to their website folder
5. Edit HTML files directly
6. Or upload new files (like your chatbot embed code)

**Step-by-step example:**
```
1. Open FileZilla
2. File → Site Manager → New Site
3. Protocol: FTP
4. Host: ftp.example.com (from their hosting)
5. User: ftpusername (from their hosting)
6. Password: ftppassword (from their hosting)
7. Click Connect

Now you can see their website files. 
Find index.html or the footer.html
Add this line before </body> tag:
```

**Code to add to their HTML:**
```html
<!-- Add before closing </body> tag -->
<script src="https://your-chatbot-api.com/embed.js"></script>
<script>
  ChatbotWidget.init({
    apiKey: "your-api-key",
    position: "bottom-right",
    theme: "light"
  });
</script>
```

**Option 2: They give you GitHub/Vercel access**
If their site is on GitHub or Vercel:
1. They add you as a collaborator
2. You edit files in GitHub
3. Site auto-deploys when you save
4. Add chatbot code to HTML
5. Deploy

---

### Scenario C: Client Uses Webflow, Wix, Squarespace (No-Code)

**These platforms don't let you edit code easily. Best approach:**

1. Use their **custom code embed** feature
2. Go to Site Settings → Custom Code
3. Paste your chatbot embed code
4. Save
5. Done

**Example embed code they can paste:**
```html
<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://your-chatbot-api.com/embed.js';
    document.head.appendChild(script);
    
    script.onload = function() {
      window.Chatbot.init({
        apiKey: 'YOUR_API_KEY',
        position: 'bottom-right'
      });
    };
  })();
</script>
```

---

### Scenario D: Client Doesn't Give You Access (Most Secure)
**You host the chatbot separately, they embed a link/widget**

Your chatbot lives at: `https://your-chatbot-domain.com/chat`

They embed this in their site:
```html
<iframe src="https://your-chatbot-domain.com/chat" width="400" height="600"></iframe>
```

Advantage: They don't need to give you access, you control the chatbot independently.

---

## 4. PRACTICAL DEMO: ADDING CHATBOT TO REAL WEBSITE

### Example: Add to a Shopify store (common client)

**Step 1:** Client goes to Shopify → Settings → Custom code (or uses an app)

**Step 2:** You provide this code:
```html
<div id="shopify-chatbot"></div>
<script>
  fetch('https://your-api.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: "Customer question",
      storeId: "shopify-123" 
    })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById('shopify-chatbot').innerHTML = data.reply;
  });
</script>
```

**Step 3:** Save. Chatbot now works on their store.

---

## 5. WEB DESIGN SERVICES DETAILS

Since you already know web design, here's how to position it:

### Simple Website ($1,500)
- Use **templates** (get from Webflow, Figma community, or build your own)
- Customize colors, text, images
- Add basic animations (hover effects, smooth scroll)
- Deploy to Vercel or Netlify
- Takes ~20-30 hours

### Advanced Website ($3,000-4,500)
- Custom design from scratch
- Advanced animations (parallax scroll, reveal on scroll, interactive sections)
- Your Pinovio is a great example of this tier
- Takes ~50-70 hours

### Web Development Only ($1,000-2,500)
- Client provides Figma design
- You code it pixel-perfect
- Clean, semantic HTML/CSS
- Takes ~20-40 hours

---

## 6. IMPLEMENTATION TIMELINE (12-14 hours/week)

### Month 1 (Now - April)
**Week 1-2:** Learn chatbots (Claude API basics)
- 7 hours learning
- 7 hours building first prototype
- **Goal:** Have a working terminal chatbot

**Week 3-4:** Deploy chatbot to web
- 7 hours learning Node/Flask/hosting
- 7 hours building website + deploying
- **Goal:** Live chatbot at a URL

### Month 2 (May - Still in School)
**Week 1-2:** Learn to add chatbot to client sites
- 7 hours studying FTP, WordPress, different platforms
- 7 hours practicing on your own sites
- **Goal:** Know how to add chatbot to any site type

**Week 3-4:** Build first client case study
- 14 hours building real chatbot for a test client
- **Goal:** Have a live case study you can show

### Month 3 (June - Summer, More Time)
- Start landing real clients
- Build 2-3 sites/chatbots per month

---

## 7. SALES & POSITIONING

### Your Pitch
"I build modern websites and add AI chatbots that help visitors navigate and get instant answers. I offer three things:
1. **Website redesigns** - make your site look professional
2. **Custom websites** - build from scratch
3. **AI chatbots** - help visitors find what they need 24/7"

### Who to sell to
- **Small businesses** (local services, e-commerce, agencies)
- **Startups** that need a quick site + chatbot
- **Web design agencies** (white-label the chatbot building)

### How to reach them
- LinkedIn: "I help [industry] businesses get more leads with AI chatbots"
- Cold email: "I've noticed your site doesn't have a chatbot. Most sites lose 30% of visitors who can't find what they need. I can add one for $2k. Here's an example..."
- Case studies: Show your work on Pinovio

---

## 8. TECH STACK RECOMMENDATION (Keep It Simple)

**Chatbot:**
- API: Claude API (easiest, most powerful)
- Backend: Node.js + Express (or Python + Flask)
- Hosting: Vercel (free tier works)
- Frontend: Simple HTML/CSS/JavaScript

**Website:**
- What you already use (HTML/CSS/JavaScript + Claude Code)
- Deploy to Vercel

**Total cost to launch:** ~$0 (free tiers)
- Vercel: free
- Claude API: pay as you go (~$0.50-5/month per client)
- FTP/hosting: client's existing hosting

---

## 9. ACTION ITEMS THIS WEEK

1. **Monday:** Get Claude API key, run the first Python chatbot code
2. **Tuesday-Wed:** Build chatbot trained on one website (Pinovio)
3. **Thursday:** Learn Vercel deployment
4. **Friday-Sat:** Deploy chatbot to Vercel + add to Pinovio
5. **Sunday:** Map out Scenario A/B/C for different client types

---

## 10. QUESTIONS TO ASK CLIENTS

When a client contacts you:

1. "Do you have an existing website or need one built?"
2. "What's your biggest pain point? (design, user experience, getting leads)"
3. "Have you thought about an AI chatbot to help customers?"
4. "What's your budget?" (Starter $3.5k, Pro $5.5k, Custom)
5. "When do you want to launch?"

---

**Start this week. Pick one path and go deep.**
