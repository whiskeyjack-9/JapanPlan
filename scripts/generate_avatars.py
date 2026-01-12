"""
Avatar Generator Utility for Japan Trip Planner
================================================
Generates 6 unique profile pictures for each user based on their uploaded photo.

Uses:
- OpenAI GPT-4 Vision to analyze the source photo
- OpenAI DALL-E 3 to generate stylized avatars
- Supabase Storage to host the images
- Supabase Database to update user records

Setup:
1. pip install openai supabase python-dotenv requests
2. Create a .env file with your credentials (see .env.example)
3. Place source photos in scripts/source_photos/ named like: julian.jpg, dave.jpg, etc.
4. Run: python scripts/generate_avatars.py
"""

import os
import sys
import base64
import requests
from pathlib import Path
from datetime import datetime

try:
    from openai import OpenAI
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError:
    print("Missing dependencies. Install with:")
    print("pip install openai supabase python-dotenv requests")
    sys.exit(1)

# Load environment variables
load_dotenv()

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')  # Use service key for admin access

# ========================================
# JAPANESE-THEMED AVATAR STYLES
# ========================================
# 6 distinct visual styles, all Japanese-themed

AVATAR_STYLES = [
    {
        "name": "ukiyoe",
        "display_name": "Ukiyo-e",
        "prompt_suffix": "in traditional Japanese ukiyo-e woodblock print style, bold outlines, flat areas of rich color, Edo period aesthetic, like artwork by Hokusai or Hiroshige"
    },
    {
        "name": "sakura_anime",
        "display_name": "Sakura Anime",
        "prompt_suffix": "in beautiful modern anime style with cherry blossoms, soft pink lighting, sparkling atmosphere, detailed expressive eyes, like a high-budget anime movie poster"
    },
    {
        "name": "sumi_ink",
        "display_name": "Sumi-e Ink",
        "prompt_suffix": "in Japanese sumi-e ink wash painting style with subtle watercolor accents, elegant brushstrokes, zen minimalism, traditional calligraphy aesthetic, contemplative mood"
    },
    {
        "name": "shrine_spirit",
        "display_name": "Shrine Spirit",
        "prompt_suffix": "in mystical Japanese shrine spirit style, ethereal glowing effects, traditional Shinto aesthetic, sacred atmosphere, omamori charm colors, spiritual and serene"
    },
    {
        "name": "neo_tokyo",
        "display_name": "Neo Tokyo",
        "prompt_suffix": "in futuristic Neo Tokyo cyberpunk style, neon pink and electric blue lights, rain-slicked reflections, kanji holographic signs, Akira and Ghost in the Shell inspired"
    },
    {
        "name": "ghibli_dream",
        "display_name": "Ghibli Dream",
        "prompt_suffix": "in Studio Ghibli inspired fantasy style, warm nostalgic lighting, magical whimsy, hand-painted texture, enchanting and heartwarming, Miyazaki film aesthetic"
    }
]

# ========================================
# TEAM MEMBERS WITH JAPANESE-THEMED SETTINGS
# ========================================
# Each person gets a unique Japanese setting for their avatars

TEAM_MEMBERS = {
    "Julian": {
        "setting": "standing beneath a magnificent weeping cherry blossom tree in full bloom, petals drifting in the breeze, soft spring sunlight filtering through pink canopy",
        "setting_short": "Cherry Blossom"
    },
    "Dave": {
        "setting": "at a serene viewpoint overlooking Mount Fuji at golden hour, the iconic snow-capped peak glowing in warm sunset colors, Lake Kawaguchi reflecting the scene",
        "setting_short": "Mount Fuji"
    },
    "Jason": {
        "setting": "walking through the towering green bamboo groves of Arashiyama, dappled sunlight streaming through swaying stalks, peaceful and mysterious atmosphere",
        "setting_short": "Bamboo Forest"
    },
    "Frank": {
        "setting": "in a traditional Japanese tea ceremony room, warm wood tones, shoji screen windows, steam rising from a ceramic tea cup, tatami floor, meditative ambiance",
        "setting_short": "Tea Ceremony"
    },
    "Cathy": {
        "setting": "standing before a vermillion torii gate pathway at Fushimi Inari shrine, lanterns glowing softly, morning mist creating ethereal depth, sacred atmosphere",
        "setting_short": "Torii Gates"
    },
    "Matylda": {
        "setting": "beside a tranquil Japanese garden with colorful koi swimming in crystal clear water, stone lanterns, perfectly raked zen gravel, autumn maple leaves floating",
        "setting_short": "Koi Garden"
    },
    "Patryk": {
        "setting": "on a rooftop overlooking the glittering Tokyo skyline at night, Tokyo Tower glowing red in the distance, city lights creating a sea of stars below",
        "setting_short": "Tokyo Night"
    }
}


def encode_image_to_base64(image_path: str) -> str:
    """Read an image file and return its base64 encoding."""
    with open(image_path, "rb") as image_file:
        return base64.standard_b64encode(image_file.read()).decode("utf-8")


def get_image_mime_type(image_path: str) -> str:
    """Get the MIME type based on file extension."""
    ext = Path(image_path).suffix.lower()
    mime_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    }
    return mime_types.get(ext, 'image/jpeg')


def analyze_photo(client: OpenAI, image_path: str) -> str:
    """
    Use GPT-4 Vision to analyze the source photo and generate a description
    suitable for avatar generation.
    """
    print(f"  Analyzing photo: {image_path}")
    
    base64_image = encode_image_to_base64(image_path)
    mime_type = get_image_mime_type(image_path)
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": """You are a creative artist helping to create stylized avatar artwork.
                
Your task: Describe the visual characteristics you see in this reference photo that would help an artist create a stylized cartoon/anime avatar. Focus on artistic elements like:
- Hair: approximate color, general style (short/long, straight/wavy/curly)
- General face shape for artistic interpretation
- Any distinctive style elements (glasses, facial hair, etc.)
- Overall aesthetic vibe

This is for creating FICTIONAL ARTISTIC AVATARS, not identifying real people.
Keep it brief (2-3 sentences) and artistic in nature.
Example: "Short dark wavy hair, round friendly face shape, wearing rectangular glasses, warm cheerful expression perfect for a Ghibli-style character." """
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "I'm creating stylized avatar art. Please describe the key visual elements from this reference that would help create an artistic avatar character:"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        max_tokens=300
    )
    
    description = response.choices[0].message.content
    
    # If the model refuses, use a generic description
    if "sorry" in description.lower() or "can't" in description.lower() or "cannot" in description.lower():
        print(f"  ⚠ Model declined to analyze photo, using generic description")
        description = "a friendly person with an approachable expression, suitable for a stylized avatar"
    else:
        print(f"  Description: {description[:100]}...")
    
    return description


def generate_avatar(client: OpenAI, description: str, style: dict, setting: str) -> str:
    """
    Use DALL-E 3 to generate an avatar based on the description, style, and setting.
    Returns the URL of the generated image.
    """
    prompt = f"""Create a stunning profile picture portrait of a person with these features: {description}

Setting: {setting}

Art style: {style['prompt_suffix']}

The image should be a beautiful close-up portrait suitable for a profile picture with the setting visible in the background. Centered composition, masterful quality, highly detailed, professional artistic execution."""
    
    print(f"    Generating {style['display_name']} style...")
    
    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="standard",
        n=1
    )
    
    return response.data[0].url


def download_image(url: str) -> bytes:
    """Download an image from a URL and return the bytes."""
    response = requests.get(url)
    response.raise_for_status()
    return response.content


def upload_to_supabase(supabase: Client, image_bytes: bytes, user_name: str, style_name: str) -> str:
    """
    Upload an image to Supabase Storage and return the public URL.
    """
    # Create a unique filename (flat structure, no subdirectories for simpler policies)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{user_name.lower()}_{style_name}_{timestamp}.png"
    
    try:
        # Upload to storage bucket
        result = supabase.storage.from_("profile-pictures").upload(
            path=filename,
            file=image_bytes,
            file_options={"content-type": "image/png", "upsert": "true"}
        )
        
        # Check for errors in result
        if hasattr(result, 'error') and result.error:
            raise Exception(f"Upload failed: {result.error}")
            
    except Exception as e:
        error_msg = str(e)
        if "row-level security" in error_msg.lower() or "403" in error_msg:
            raise Exception(
                f"Storage RLS policy error. Please run the SQL in database/storage_policies.sql "
                f"or disable RLS on the profile-pictures bucket. Original error: {error_msg}"
            )
        raise
    
    # Get public URL
    public_url = supabase.storage.from_("profile-pictures").get_public_url(filename)
    
    return public_url


def get_user_id(supabase: Client, user_name: str) -> str:
    """Get the user ID from the database by name."""
    result = supabase.table("users").select("id").eq("name", user_name).single().execute()
    return result.data["id"] if result.data else None


def save_avatar_to_db(supabase: Client, user_id: str, avatar_urls: list):
    """
    Save the generated avatar URLs to the user's record.
    Stores the first avatar as the main avatar_url and all options in avatar_options.
    """
    supabase.table("users").update({
        "avatar_url": avatar_urls[0],  # Set first as default
        "avatar_options": avatar_urls   # Store all options
    }).eq("id", user_id).execute()


def process_user(openai_client: OpenAI, supabase: Client, user_name: str, user_config: dict, source_photo_path: str):
    """
    Process a single user: analyze their photo, generate avatars, upload, and save to DB.
    """
    print(f"\n{'='*60}")
    print(f"Processing: {user_name}")
    print(f"Setting: {user_config['setting_short']}")
    print(f"{'='*60}")
    
    # Step 1: Analyze the source photo
    description = analyze_photo(openai_client, source_photo_path)
    
    # Step 2: Generate avatars for each style
    avatar_urls = []
    for style in AVATAR_STYLES:
        try:
            # Generate the avatar with user's personalized Japanese setting
            temp_url = generate_avatar(
                openai_client, 
                description, 
                style, 
                user_config['setting']
            )
            
            # Download the image
            image_bytes = download_image(temp_url)
            
            # Upload to Supabase
            permanent_url = upload_to_supabase(supabase, image_bytes, user_name, style["name"])
            avatar_urls.append(permanent_url)
            
            print(f"    ✓ {style['display_name']}: Uploaded successfully")
            
        except Exception as e:
            print(f"    ✗ {style['display_name']}: Failed - {str(e)}")
    
    # Step 3: Save to database
    if avatar_urls:
        user_id = get_user_id(supabase, user_name)
        if user_id:
            save_avatar_to_db(supabase, user_id, avatar_urls)
            print(f"  ✓ Saved {len(avatar_urls)} avatars to database for {user_name}")
        else:
            print(f"  ✗ User '{user_name}' not found in database")
    
    return avatar_urls


def main():
    """Main entry point."""
    print("="*60)
    print("  Japan Trip Planner - Avatar Generator")
    print("="*60)
    
    # Validate configuration
    if not OPENAI_API_KEY:
        print("Error: OPENAI_API_KEY not set in environment")
        sys.exit(1)
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        sys.exit(1)
    
    # Initialize clients
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    # Source photos directory
    source_dir = Path(__file__).parent / "source_photos"
    
    if not source_dir.exists():
        print(f"\nCreating source photos directory: {source_dir}")
        source_dir.mkdir(parents=True)
        print(f"\nPlease add photos for each user to: {source_dir}")
        print("Name them like: julian.jpg, dave.jpg, jason.jpg, etc.")
        sys.exit(0)
    
    # Process each team member
    results = {}
    for name, config in TEAM_MEMBERS.items():
        # Find the source photo (try common extensions)
        source_photo = None
        for ext in ['.jpg', '.jpeg', '.png', '.webp']:
            potential_path = source_dir / f"{name.lower()}{ext}"
            if potential_path.exists():
                source_photo = potential_path
                break
        
        if source_photo:
            try:
                avatar_urls = process_user(openai_client, supabase, name, config, str(source_photo))
                results[name] = {"success": True, "count": len(avatar_urls)}
            except Exception as e:
                print(f"  ✗ Error processing {name}: {str(e)}")
                results[name] = {"success": False, "error": str(e)}
        else:
            print(f"\n⚠ No source photo found for {name}")
            print(f"  Expected: {source_dir}/{name.lower()}.jpg (or .png, .jpeg, .webp)")
            results[name] = {"success": False, "error": "No source photo"}
    
    # Summary
    print("\n" + "="*60)
    print("  SUMMARY")
    print("="*60)
    for name, result in results.items():
        if result["success"]:
            print(f"  ✓ {name}: Generated {result['count']} avatars")
        else:
            print(f"  ✗ {name}: {result.get('error', 'Failed')}")
    
    total_success = sum(1 for r in results.values() if r["success"])
    print(f"\nTotal: {total_success}/{len(TEAM_MEMBERS)} users processed successfully")


if __name__ == "__main__":
    main()
