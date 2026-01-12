# 🗾 Japan 2026 Trip Planner

A beautiful collaborative trip planning tool for your group adventure to Japan!

![Japan Trip Planner](https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80)

## ✨ Features

- **User Selection** - Pick who you are from the friend roster and stay logged in
- **Availability Planning** - Set your travel window, preferred trip length, and ideal dates
- **Visual Timeline** - See everyone's availability at a glance on an interactive timeline
- **Destination Planning** - Browse beautiful Japanese cities and allocate days to each
- **Attraction Voting** - Upvote/downvote attractions you want to visit
- **Real-time Sync** - All changes sync instantly across all users (with Supabase)
- **Dashboard** - See the most popular dates, destinations, and attractions

## 🚀 Quick Start

### Demo Mode (No Setup Required)

Simply open `index.html` in your browser! The app will run in demo mode using localStorage. Perfect for testing, but data won't sync between different users/devices.

### Full Setup with Supabase (Recommended)

For real-time collaboration between all your friends:

#### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project" and fill in the details
3. Wait for the project to be created

#### 2. Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `database/schema.sql`
4. Paste it into the editor and click "Run"
5. This will create all tables, insert seed data, and set up security policies

#### 3. Configure the App

1. In Supabase, go to **Settings** > **API**
2. Copy your **Project URL** and **anon public** key
3. Open `js/config.js` and update:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

#### 4. Deploy

**Option A: Render (Recommended)**
1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create a new "Static Site"
3. Connect your GitHub repository
4. Set build command to empty and publish directory to `.`
5. Deploy!

**Option B: GitHub Pages**
1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Select "main" branch and root folder
4. Your site will be live at `https://username.github.io/repo-name`

**Option C: Netlify**
1. Drag and drop the project folder onto [netlify.com/drop](https://netlify.com/drop)
2. Done! Get your unique URL

## 📁 Project Structure

```
JapanPlan/
├── index.html          # Main HTML file
├── css/
│   ├── styles.css      # Main styles (Sakura Nights theme)
│   └── components.css  # Component-specific styles
├── js/
│   ├── config.js       # Configuration (Supabase keys, team members)
│   ├── supabase-client.js  # Database operations
│   ├── app.js          # Main application logic
│   ├── dashboard.js    # Dashboard module
│   ├── availability.js # Date planning module
│   ├── destinations.js # City selection module
│   ├── attractions.js  # Voting module
│   └── animations.js   # Visual effects
├── database/
│   └── schema.sql      # Supabase database schema
└── README.md
```

## 👥 Team Members

The app comes pre-configured with your friend group:
- Julian, Dave, Jason, Frank, Cathy, Matylda, Patryk

To add/modify team members:
1. Update `TRIP_CONFIG.teamMembers` in `js/config.js`
2. If using Supabase, also update the users in your database

## 🎨 Customization

### Adding Profile Pictures

Replace the placeholder avatars with real photos:

1. **Option A: Direct URLs**
   - Upload photos somewhere (Imgur, etc.)
   - Update the users table in Supabase with `avatar_url`

2. **Option B: Local Files**
   - Create an `images/avatars/` folder
   - Add photos named like `julian.jpg`
   - Update `avatar_url` to `images/avatars/julian.jpg`

### Changing the Theme

The Sakura Nights theme uses CSS custom properties. Edit `css/styles.css`:

```css
:root {
    --sakura-light: #ffd6e0;    /* Light pink */
    --sakura-medium: #ff8fab;   /* Medium pink */
    --sakura-deep: #ff5c8d;     /* Deep pink */
    --bg-primary: #0d0d12;      /* Background */
    /* ... more variables */
}
```

### Adding More Cities/Attractions

- Use the **+ button** in the Destinations or Attractions sections
- Or add directly to Supabase/schema.sql

## 🔧 Technical Notes

### Browser Support
- Chrome, Firefox, Safari, Edge (modern versions)
- Mobile responsive design included

### Dependencies
- [Supabase JS Client](https://github.com/supabase/supabase-js) (loaded via CDN)
- Google Fonts (Zen Kaku Gothic New, Noto Serif JP)
- No build tools required!

### Real-time Updates
When connected to Supabase, changes sync in real-time:
- Someone sets their dates → Timeline updates for everyone
- Someone votes on an attraction → Vote counts update instantly
- Someone adds a destination → Appears for all users

## 📅 Trip Timeline

- **Planning Period**: Now until July 2026
- **Trip Window**: July 1 - August 31, 2026
- **Default Trip Length**: 14 days (adjustable 7-21 days)

## 🐛 Troubleshooting

**App not loading?**
- Check browser console for errors
- Verify Supabase URL and key are correct

**Data not syncing?**
- Confirm Supabase tables were created
- Check that RLS policies allow access
- Verify realtime is enabled for tables

**Images not showing?**
- Some Unsplash URLs may expire
- Replace with fresh URLs from [unsplash.com](https://unsplash.com)

## 💖 Enjoy Planning!

Have an amazing trip to Japan! 🇯🇵🌸

---

Built with love for the Japan 2026 crew 🗻
