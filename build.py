#!/usr/bin/env python3
"""
Jarvis AI — Unified Build Script

This script automates the build process for the Jarvis AI platform:
1. Syncs ACTIVE_PROVIDERS from configuration/backend_config/config.py to frontend/src/generated/models.json
2. Installs backend dependencies
3. Installs frontend dependencies
4. Builds the frontend using Vite
5. Copies frontend build output to dist/
6. Initializes database directories
"""

import os
import sys
import json
import shutil
import subprocess
import argparse
from pathlib import Path

# Project root directory
PROJECT_ROOT = Path(__file__).resolve().parent

# Paths
FRONTEND_DIR = PROJECT_ROOT / "frontend"
CONFIG_FILE = PROJECT_ROOT / "configuration" / "backend_config" / "config.py"
GENERATED_MODELS_FILE = FRONTEND_DIR / "src" / "generated" / "models.json"
REQUIREMENTS_FILE = PROJECT_ROOT / "configuration" / "backend_config" / "requirements.txt"
DIST_DIR = PROJECT_ROOT / "dist"
DB_DIR = PROJECT_ROOT / "database"

def parse_args():
    parser = argparse.ArgumentParser(description="Jarvis AI Build Script")
    parser.add_argument("--frontend", action="store_true", help="Build frontend only")
    parser.add_argument("--backend", action="store_true", help="Build backend only (install deps/init db)")
    parser.add_argument("--clean", action="store_true", help="Clean build artifacts before building")
    return parser.parse_args()

def clean_artifacts():
    """Remove previous build artifacts."""
    print("🧹 Cleaning previous build artifacts...")
    dirs_to_clean = [
        FRONTEND_DIR / "dist",
        PROJECT_ROOT / "dist",
        FRONTEND_DIR / "src" / "generated"
    ]
    for d in dirs_to_clean:
        if d.exists() and d.is_dir():
            shutil.rmtree(d)
            print(f"  Removed: {d}")
    print("✅ Clean complete.\n")

def sync_models():
    """
    Parse config.py to find ACTIVE_PROVIDERS and MODEL_* variables,
    then generate models.json for the frontend.
    """
    print("🔄 Syncing models from config.py to frontend...")
    
    if not CONFIG_FILE.exists():
        print(f"❌ Error: Config file not found at {CONFIG_FILE}")
        sys.exit(1)

    # Simple regex/string parsing since we don't want to import config.py
    # (which might fail if requirements aren't installed yet)
    import re
    
    config_content = CONFIG_FILE.read_text(encoding="utf-8")
    
    # 1. Extract ACTIVE_PROVIDERS list
    # e.g. ACTIVE_PROVIDERS = ["nvidia", "groq", "mistral"]
    active_providers_match = re.search(r'ACTIVE_PROVIDERS\s*=\s*\[(.*?)\]', config_content)
    if not active_providers_match:
        print("⚠️ Warning: ACTIVE_PROVIDERS not found in config.py")
        active_providers = []
    else:
        # Parse the list
        items = active_providers_match.group(1).split(",")
        active_providers = [item.strip().strip("'\"") for item in items if item.strip()]

    # 2. Extract model variables
    # e.g. MODEL_GROQ = "openai/gpt-oss-120b"
    model_vars = {}
    for line in config_content.splitlines():
        line = line.strip()
        if line.startswith("MODEL_") and "=" in line and not line.startswith("#"):
            parts = line.split("=", 1)
            key = parts[0].strip()
            # Extract the actual string value
            val_match = re.search(r'["\'](.*?)["\']', parts[1])
            if val_match:
                model_vars[key] = val_match.group(1)

    provider_map = {
        "openai":     ("MODEL_OPENAI",     "GPT-4o"),
        "google":     ("MODEL_GOOGLE",     "Gemini"),
        "mistral":    ("MODEL_MISTRAL",    "Mistral"),
        "groq":       ("MODEL_GROQ",       "Groq"),
        "openrouter": ("MODEL_OPENROUTER", "OpenRouter"),
        "nvidia":     ("MODEL_NVIDIA",     "NVIDIA"),
    }

    generated_models = []
    for provider in active_providers:
        if provider not in provider_map:
            continue
            
        config_key, display_name = provider_map[provider]
        if config_key in model_vars:
            model_id = model_vars[config_key]
            generated_models.append({
                "id": f"{provider}-{model_id}",
                "name": f"{display_name} ({model_id})",
                "provider": provider,
                "model": model_id
            })

    if not generated_models:
        print("⚠️ Warning: No active models matched in config.py. Falling back to default.")
        generated_models = [{"id": "default", "name": "Default Model", "provider": "none", "model": ""}]

    # Ensure generated directory exists
    GENERATED_MODELS_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Write JSON
    with open(GENERATED_MODELS_FILE, "w", encoding="utf-8") as f:
        json.dump(generated_models, f, indent=2)
        
    print(f"✅ Generated {GENERATED_MODELS_FILE.relative_to(PROJECT_ROOT)} with {len(generated_models)} models\n")

def init_database():
    """Create necessary database directories."""
    print("🗄️ Initializing database directories...")
    DB_DIR.mkdir(exist_ok=True)
    (DB_DIR / "vector_db").mkdir(exist_ok=True)
    
    memory_file = DB_DIR / "memory.json"
    if not memory_file.exists():
        memory_file.write_text("{}")
        print(f"  Created: {memory_file}")
    
    print("✅ Database initialized.\n")

def install_backend_deps():
    """Install Python backend dependencies."""
    print("🐍 Installing backend dependencies...")
    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", str(REQUIREMENTS_FILE)],
            check=True
        )
        print("✅ Backend dependencies installed.\n")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install backend dependencies: {e}")
        sys.exit(1)

def build_frontend():
    """Install npm deps and build frontend."""
    print("🎨 Building frontend (React/Vite)...")
    
    # Use 'npm' executable correctly on Windows
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    
    print("  Installing frontend dependencies...")
    try:
        subprocess.run([npm_cmd, "install"], cwd=str(FRONTEND_DIR), check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install frontend dependencies: {e}")
        sys.exit(1)
        
    print("  Running Vite build...")
    try:
        subprocess.run([npm_cmd, "run", "build"], cwd=str(FRONTEND_DIR), check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to build frontend: {e}")
        sys.exit(1)
        
    print("✅ Frontend build completed.\n")

def copy_build_output():
    """Copy frontend dist to project root dist for deployment/Cloudflare."""
    print("📁 Copying build output...")
    frontend_dist = FRONTEND_DIR / "dist"
    
    if not frontend_dist.exists():
        print(f"❌ Error: Frontend dist directory not found at {frontend_dist}")
        sys.exit(1)
        
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
        
    shutil.copytree(frontend_dist, DIST_DIR)
    print(f"✅ Build output ready at {DIST_DIR}\n")

def main():
    args = parse_args()
    
    print("=" * 50)
    print("  🚀 JARVIS AI — Build Script")
    print("=" * 50 + "\n")
    
    if args.clean:
        clean_artifacts()
        
    run_all = not args.frontend and not args.backend
    
    if run_all or args.backend:
        install_backend_deps()
        init_database()
        
    if run_all or args.frontend:
        # Sync models goes before frontend build so the JSON is included
        sync_models()
        build_frontend()
        copy_build_output()
        
    print("=" * 50)
    print("  🎉 Build completed successfully!")
    if run_all or args.frontend:
        print(f"  🌐 Frontend output: ./dist/")
    if run_all or args.backend:
        print(f"  🐍 Environment ready.")
    print("=" * 50)

if __name__ == "__main__":
    main()
