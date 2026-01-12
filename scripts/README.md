# Avatar Generator Utility

Generates 6 unique stylized profile pictures for each user based on their uploaded photos.

## How It Works

1. **GPT-4 Vision** analyzes each source photo to extract facial features
2. **DALL-E 3** generates 6 different styled avatars based on that description
3. Images are uploaded to **Supabase Storage**
4. URLs are saved to the **users table** in the database

## Japanese-Themed Avatar Styles

Each user gets 6 unique avatars, all Japanese-themed:

| Style | Description |
|-------|-------------|
| **Ukiyo-e** | Traditional woodblock print style, like Hokusai or Hiroshige |
| **Sakura Anime** | Modern anime with cherry blossoms, sparkling atmosphere |
| **Sumi-e Ink** | Japanese ink wash painting with zen minimalism |
| **Shrine Spirit** | Mystical Shinto shrine aesthetic, ethereal glowing effects |
| **Neo Tokyo** | Futuristic cyberpunk, neon lights, Akira/Ghost in the Shell inspired |
| **Ghibli Dream** | Studio Ghibli fantasy style, warm nostalgic Miyazaki aesthetic |

## Personalized Japanese Settings

Each person also gets a unique Japanese setting for their avatars:

| Person | Setting |
|--------|---------|
| **Julian** | Cherry blossom tree in full bloom |
| **Dave** | Mount Fuji at golden hour sunset |
| **Jason** | Arashiyama bamboo forest |
| **Frank** | Traditional tea ceremony room |
| **Cathy** | Fushimi Inari torii gate pathway |
| **Matylda** | Japanese garden with koi pond |
| **Patryk** | Tokyo skyline at night |

## Setup

### 1. Install Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

### 2. Create Environment File

Create a file named `.env` in the `scripts` folder with:

```
OPENAI_API_KEY=sk-your-openai-api-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
```

**Important:** Use the Supabase **Service Role** key (not the anon key) for admin storage access.
Find it in: Supabase Dashboard → Settings → API → service_role key

### 3. Create Supabase Storage Bucket

In your Supabase Dashboard:
1. Go to **Storage**
2. Click **New bucket**
3. Name it `profile-pictures`
4. Enable **Public bucket** (so avatars can be displayed on the website)

### 4. Update Database Schema (if needed)

Run this SQL in Supabase SQL Editor to add avatar options column:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_options TEXT[];
```

### 5. Add Source Photos

Create a folder `scripts/source_photos/` and add photos for each user:

```
scripts/
  source_photos/
    julian.jpg
    dave.jpg
    jason.jpg
    frank.jpg
    cathy.jpg
    matylda.jpg
    patryk.jpg
```

Photos should be:
- Clear, front-facing shots
- Good lighting
- JPG, PNG, or WebP format

### 6. Run the Generator

```bash
cd scripts
python generate_avatars.py
```

## Cost Estimate

- **GPT-4 Vision**: ~$0.01 per image analyzed (7 images = ~$0.07)
- **DALL-E 3**: ~$0.04 per image generated (42 images = ~$1.68)
- **Total**: Approximately **$1.75** for all 42 avatars

## Output

After running, each user will have:
- `avatar_url`: Their default avatar (first style)
- `avatar_options`: Array of all 6 avatar URLs

The website's avatar picker will automatically show these options when users click to change their profile picture.

## Troubleshooting

### "No source photo found"
Ensure photos are named exactly like the user names (lowercase): `julian.jpg`, not `Julian.jpg`

### "User not found in database"
Make sure users exist in the Supabase `users` table with matching names

### Storage upload fails
1. Verify the `profile-pictures` bucket exists
2. Check it's set to public
3. Confirm you're using the Service Role key (not anon key)
