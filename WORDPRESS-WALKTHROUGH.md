# WordPress Client Setup — Real Step-by-Step Walkthrough

This is what actually happens when a client gives you WordPress access.

---

## THE SCENARIO

Your client (Tony's Pizza Shop) emails you:
```
Hi! Here's my WordPress login:
URL: tonyspizza.com
Admin login: tony@tonyspizza.com
Password: MyPassword123!
```

---

## STEP 1: Go to Their WordPress Admin

**What you do:**
1. Open a new browser tab
2. Type in the address bar: `tonyspizza.com/wp-admin`
3. Press Enter

**What you see:**
- A login form that looks like this:
  ```
  WordPress
  [Username field] ← Enter: tony@tonyspizza.com
  [Password field] ← Enter: MyPassword123!
  [Remember me checkbox]
  [Log In button]
  ```

**Click:** Log In

---

## STEP 2: You're Now in the Dashboard

**What you see when you log in:**

```
LEFT SIDEBAR (navigation menu):
├── Dashboard (home icon) ← You are here
├── Posts
├── Media
├── Pages
├── Comments
├── Appearance ← THIS IS WHERE YOU EDIT DESIGN
├── Plugins
├── Users
├── Tools
└── Settings

TOP: Welcome message like "Welcome back, Tony!"

CENTER: Dashboard with:
- Recent posts
- Site health status
- WordPress updates available
```

**You can now edit anything on their site from here.**

---

## STEP 3: Edit a Page (Example: Home Page)

Let's say you need to update the home page text or images.

**Click:** Pages (in left sidebar)

**What you see:**
```
Pages list:
- Home ← Click this
- About
- Menu
- Contact
- Delivery Info
```

**Click:** Home

**Now you're in the page editor:**

```
╔════════════════════════════════════════════╗
║ Home (page title at top)                   ║
├────────────────────────────────────────────┤
║                                            ║
║ [Large text block that says:]              ║
║ "Welcome to Tony's Pizza"                  ║
║                                            ║
║ [Click to edit - you can type here]        ║
║                                            ║
║ [Image of pizza]                           ║
║                                            ║
║ [More text sections you can edit]          ║
║                                            ║
║                                            ║
║ BOTTOM RIGHT:                              ║
║ [Update button] ← Click to save changes    ║
╚════════════════════════════════════════════╝
```

**To edit:** Just click on any text block and start typing. Or click the pencil icon to change it.

**To save:** Click the blue "Update" button in the bottom right.

**That's it.** The change is live on their site.

---

## STEP 4: Change the Site Design/Theme

Let's say you want to change colors, fonts, or the overall look.

**Click:** Appearance (in left sidebar)

**What you see:**
```
Appearance submenu opens:
├── Themes ← Click this
├── Customize ← Or this for quick edits
├── Widgets
├── Menus
├── Header
├── Background
└── Theme File Editor (advanced - don't touch)
```

### Option A: Change Colors/Fonts Quickly

**Click:** Customize

**What you see:**
```
Left panel opens with options:
├── Site Identity (logo, tagline)
├── Colors
│   ├── Primary Color: [color picker]
│   ├── Secondary Color: [color picker]
│   └── Text Color: [color picker]
├── Typography
│   ├── Heading Font: [dropdown]
│   └── Body Font: [dropdown]
├── Layout
├── etc.

RIGHT SIDE: Live preview of your site
           with changes shown in real-time
```

**Change any color or font.** You'll see the site update in real-time on the right.

**Click:** Publish (when done)

---

## STEP 5: Add the Chatbot Code

This is the new part. You want to add your chatbot to their site.

**Click:** Appearance → Customize (or Widgets)

**Look for:** Custom Code section or HTML widget

**Paste this before the `</body>` tag:**

```html
<!-- Your Chatbot Code -->
<script src="https://your-chatbot-api.com/embed.js"></script>
<script>
  ChatbotWidget.init({
    apiKey: "your-api-key-here",
    position: "bottom-right",
    theme: "light"
  });
</script>
```

**How it works:**
- Line 1: Loads the chatbot script
- Line 2: Initializes the chatbot with your settings
- `position: "bottom-right"` = where it appears on their site
- `theme: "light"` = dark or light style

**Click:** Publish/Save

**Result:** Chatbot now appears on every page of their site in the bottom right corner. ✅

---

## STEP 6: Test It

1. Go to `tonyspizza.com` (the front-end, not /wp-admin)
2. Scroll to bottom right
3. See your chatbot widget there
4. Click it and test a message
5. Take a screenshot
6. Send to client: "Here's your chatbot live on your site!"

---

## STEP 7: Show Client & Get Approval

Send them a message:

```
"Hi Tony! I've set up the chatbot on your site. 
Go to tonyspizza.com and check the bottom right corner.
Try asking it 'What are your hours?' or 'Do you deliver?'

Let me know if you'd like any changes!"
```

Once they approve → you're done with this part.

---

## WHAT IF THEY USE A DIFFERENT PLATFORM?

### Shopify (E-commerce)
- Same idea: go to their `storename.myshopify.com` admin
- Click: Online Store → Themes → Edit Code
- Find: `theme.liquid` file
- Paste your chatbot code before `</body>`

### Webflow / Wix / Squarespace
- Go to their site settings
- Look for "Custom Code" or "Embed Code"
- Paste your chatbot code there

### Custom HTML (built from scratch)
- They give you FTP access
- Download FileZilla (free software)
- Connect with their FTP credentials
- Find `index.html` or `footer.html`
- Edit it in a text editor
- Add your chatbot code before `</body>`
- Re-upload the file

---

## COMMON THINGS YOU'LL DO

| Task | Where in WordPress |
|------|-------------------|
| Edit text on a page | Pages → [Page name] → click text → type |
| Change images | Media → Upload new images, then add to pages |
| Change colors/fonts | Appearance → Customize |
| Add a chatbot | Appearance → Customize → Custom Code section |
| Change menu/navigation | Appearance → Menus |
| Install a plugin (if needed) | Plugins → Add New → search → Install |
| Change site title/tagline | Appearance → Customize → Site Identity |
| Check site traffic | Tools → Site Health (or install Jetpack/MonsterInsights) |

---

## RED FLAGS / THINGS TO AVOID

❌ Don't click "Theme File Editor" unless you know what you're doing  
❌ Don't delete plugins they're using  
❌ Don't mess with Settings → Permalinks unless you know what it does  
❌ Don't deactivate themes they're not using (leave them alone)  
✅ DO backup before making big changes (Plugins → BackWPup or similar)  
✅ DO test on your own WordPress first if you're nervous

---

## YOU NOW KNOW HOW TO

1. ✅ Log into a client's WordPress site
2. ✅ Edit pages and content
3. ✅ Change design (colors, fonts)
4. ✅ Add your chatbot
5. ✅ Show the client what you did

**This covers 80% of what you'll do for small business clients.**

The rest is just: "Practice this → Get comfortable → Start taking client work."

---

## NEXT STEP: FTP (For Custom HTML Sites)

When a client doesn't have WordPress, they might have a custom HTML site. You'll need FTP access. Want that walkthrough next?
