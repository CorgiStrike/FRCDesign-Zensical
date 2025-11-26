Temporary Repo for converting the site to zensical

# Setup Instructions:

Install UV

Windows:
<code>powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"</code>

macOS and Linux:
<code>curl -LsSf https://astral.sh/uv/install.sh | sh</code>

Restart your terminal after installation.

# Install Dependencies:
Run: <code>uv sync</code>

# Run the site:
<code>uv run zensical serve</code>

# Open your browser
Go to localhost:8000 for preview
