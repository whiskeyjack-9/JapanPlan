"""
Upload Pre-Generated Avatars to Supabase
=========================================
Clears existing profile pictures and uploads new ones from images/avatars folder.
"""

import os
import sys
from pathlib import Path

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError:
    print("Missing dependencies. Install with:")
    print("pip install supabase python-dotenv")
    sys.exit(1)

# Load environment variables from scripts/.env
script_dir = Path(__file__).parent
load_dotenv(script_dir / ".env")

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

BUCKET_NAME = "profile-pictures"

# Team members to process
TEAM_MEMBERS = ["Julian", "Dave", "Jason", "Frank", "Cathy", "Matylda", "Patryk"]


def clear_bucket(supabase: Client):
    """Delete all files from the profile-pictures bucket."""
    print("\n" + "="*60)
    print("  STEP 1: Clearing existing profile pictures")
    print("="*60)

    try:
        # List all files in the bucket
        files = supabase.storage.from_(BUCKET_NAME).list()

        if not files:
            print("  No existing files found in bucket")
            return

        # Get file names (excluding folders)
        file_names = [f["name"] for f in files if f.get("name")]

        if not file_names:
            print("  No files to delete")
            return

        print(f"  Found {len(file_names)} files to delete:")
        for name in file_names:
            print(f"    - {name}")

        # Delete all files
        result = supabase.storage.from_(BUCKET_NAME).remove(file_names)
        print(f"  Deleted {len(file_names)} files")

    except Exception as e:
        print(f"  Warning: Could not clear bucket: {e}")
        print("  Continuing with upload...")


def upload_user_avatars(supabase: Client, user_name: str, avatars_dir: Path) -> list:
    """Upload all avatar images for a user and return the URLs."""
    user_folder = avatars_dir / user_name

    if not user_folder.exists():
        print(f"    Folder not found: {user_folder}")
        return []

    # Find all image files in the user's folder
    image_files = sorted(list(user_folder.glob("*.png")) + list(user_folder.glob("*.jpg")))

    if not image_files:
        print(f"    No images found in folder")
        return []

    avatar_urls = []

    for image_path in image_files:
        try:
            # Create filename for Supabase
            filename = f"{user_name.lower()}_{image_path.name}"

            # Read the image
            with open(image_path, "rb") as f:
                image_bytes = f.read()

            # Upload to Supabase
            result = supabase.storage.from_(BUCKET_NAME).upload(
                path=filename,
                file=image_bytes,
                file_options={"content-type": "image/png", "upsert": "true"}
            )

            # Get public URL
            public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)
            avatar_urls.append(public_url)

            print(f"    Uploaded: {image_path.name}")

        except Exception as e:
            print(f"    Failed to upload {image_path.name}: {e}")

    return avatar_urls


def update_user_database(supabase: Client, user_name: str, avatar_urls: list):
    """Update the user's avatar_url and avatar_options in the database."""
    if not avatar_urls:
        return False

    try:
        result = supabase.table("users").update({
            "avatar_url": avatar_urls[0],
            "avatar_options": avatar_urls
        }).eq("name", user_name).execute()

        if result.data:
            print(f"    Database updated with {len(avatar_urls)} avatar options")
            return True
        else:
            print(f"    User '{user_name}' not found in database")
            return False

    except Exception as e:
        print(f"    Database update failed: {e}")
        return False


def main():
    print("="*60)
    print("  Upload Avatars to Supabase")
    print("="*60)

    # Validate configuration
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in scripts/.env")
        sys.exit(1)

    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print(f"Connected to: {SUPABASE_URL}")

    # Avatars directory (relative to project root)
    project_root = script_dir.parent
    avatars_dir = project_root / "images" / "avatars"

    if not avatars_dir.exists():
        print(f"Error: Avatars directory not found: {avatars_dir}")
        sys.exit(1)

    print(f"Avatars directory: {avatars_dir}")

    # Step 1: Clear existing files
    clear_bucket(supabase)

    # Step 2: Upload new avatars
    print("\n" + "="*60)
    print("  STEP 2: Uploading new avatars")
    print("="*60)

    results = {}

    for user_name in TEAM_MEMBERS:
        print(f"\n  Processing: {user_name}")

        # Upload images
        avatar_urls = upload_user_avatars(supabase, user_name, avatars_dir)

        if avatar_urls:
            # Update database
            success = update_user_database(supabase, user_name, avatar_urls)
            results[user_name] = {"success": success, "count": len(avatar_urls)}
        else:
            print(f"    No avatars to upload")
            results[user_name] = {"success": False, "count": 0, "reason": "No images found"}

    # Summary
    print("\n" + "="*60)
    print("  SUMMARY")
    print("="*60)

    for name, result in results.items():
        if result["success"]:
            print(f"  {name}: {result['count']} avatars uploaded")
        elif result["count"] == 0:
            print(f"  {name}: No images in folder (skipped)")
        else:
            print(f"  {name}: Failed")

    successful = sum(1 for r in results.values() if r["success"])
    print(f"\n  Total: {successful}/{len(TEAM_MEMBERS)} users updated")


if __name__ == "__main__":
    main()
