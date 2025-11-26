Temporary Repo for converting the site to zensical

# Methods of Contributing

## Public Contribution

Join [the development discord server](https://discord.gg/jJePmxcBYm) and check [the trello](https://trello.com/b/Th5kvaoQ/frcdesignorg-website) to see what's being done, submit issues and bugs, and get review for potential changes or additions you want to make.

## Setting up GitHub and VS Code
### Install Prerequisites
Make sure to download the correct versions for the OS that you have (Windows, Mac, or Linux).

Windows installers will almost always need to be the 64-bit version if there is a distinction.

- [VSCode](https://code.visualstudio.com/)
    - Download the stable build for your OS
    - Use all default options for installation, except creating a desktop icon if you want

- [GitHub Desktop](https://desktop.github.com/) (Optional but recommended, VS Code has GitHub integration but it can be confusing)
    - After installing, select "Sign in to GitHub.com"
    - Sign in or sign up for a new GitHub account, then click "Authorize Desktop"
        - If you choose to sign up, you must verify your account with a captcha at the end of the registration and an emailed code
        - If the captcha fails, try disabling a privacy extension that might be interfering
        - Set up the rest of your account (you may choose to sign up for GitHub education but that isn't required, the free version is fine)
        - If it doesn't take you to the authorization page after signing up, go back to the GitHub Desktop application, press "Cancel", the select "Sign in to GitHub.com" again
    - Allow your browser to open GitHub Desktop
    - Click "Finish"

### Clone the Repository

**For Public Contributors:**

1. Go to [the repository website](https://github.com/davidsdesignserver/dds-manual)
2. Click "Fork" near the top right, then click "Create Fork" on the next screen
3. Open GitHub Desktop and select "Clone a repository from the Internet..." or go to ```file -> Clone repository...``` in the very top left
4. Under "GitHub.com", select your forked ```[username]/dds-manual``` repository  and click "Clone"
5. After it clones the repository (downloads a copy of it to your computer), it will ask how you plan to use the fork. Select "To contribute to the parent project" and click "Continue"

**For Internal Contributors (added to the main repository):**

1. Open GitHub Desktop and select "Clone a repository from the Internet..." or go to ```file -> Clone repository...``` in the very top left
2. Under "GitHub.com", select the ```davidsdesignserver/dds-manual``` repository and click "Clone"
3. After it clones the repository (downloads a copy of it to your computer), it will ask how you plan to use the fork. Select "To contribute to the parent project" and click "Continue"

## Setting up Local Preview
You can get a local hosted version of the website to have a live preview of the site while editing.

### Install UV

1. Open the repository in VS Code (doesn't matter which branch)
2. Toggle the bottom panel on if there isn't one with the shortcut ```Ctrl + J```
3. Ensure you have the Command Prompt terminal open (if not, you can click the dropdown next to the + on the top righthand side of the bottom panel and click Command Prompt)
4. Run the following command depending on your operating system:

    Windows: <code>powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"</code>

    macOS and Linux: <code>curl -LsSf https://astral.sh/uv/install.sh | sh</code>

5. After installation, restart the terminal or VS Code if you're using that. Otherwise the following commands will error from not finding UV.

### Install Dependencies
Run <code>uv sync --link-mode=copy</code> in the Command Prompt terminal.

### Run the Site
Run <code>uv run zensical serve</code> in the Command Prompt terminal.

### Open your browser
Go to localhost:8000 for preview

After the first installation, you can run the site at any time with <code>uv run zensical serve</code> in the root of the repository.

## Write and Submit a Contribution

1. Create a new branch by going to the "Current branch" dropdown at the top of GitHub Desktop, pressing "New branch", naming it and clicking "Create branch".
    - Typically you want to make changes in branches (not main), then do what's called a "pull request" to get those changes "pulled" and merged over to the original main branch
    - Name the branch something related to the overall changes you're making, e.g. "contributors-guide" or "3A-cleanup". You should expect to delete the branch after a pull request, so keep it specific enough to your changes
    - Make sure to publish the branch by clicking the button for it that shows up after you create a new branch
2. Click "Open in Visual Studio Code" to open VS Code.
3. If you get a pop-up that says "Do you trust the authors of the files in this folder?", check the box next to "Trust the authors of all files in the parent folder 'GitHub'" (for no further popups when you clone repositories in the future) and click "Yes, I trust the authors".
4. Set up VS Code how you like if this is your first time running it (themes, extensions).
    - The "Code Spell Checker" extension is suggested
    - Enable autosave in the ```file``` menu by toggling it on
5. Make a set of changes.
    - All the website files and folders are contained in the ```docs``` folder, except the ```mkdocs.yml``` file which contains the directory for the sidebar of the website

6. Whenever you reach a good point to stop where you want to save your changes to the cloud, you want to make what's called a "commit", which is where the changes are saved to the branch. You then have to "push" any commits to get them uploaded to the cloud, otherwise they will remain local. You can do this through VS Code or GitHub Desktop, but we'll go through GitHub Desktop to keep all version control actions centralized there.
7. Open Github Desktop and make sure "Changes" on the sidebar is selected. All changes selected in the sidebar will be added to the commit (the changes are "staged" for the commit). Type a summary of the commit (description optional) and press "Commit to [branch]".
8. Click the button to push the commit(s) you've made to the cloud (either up above or in the middle of the screen).
    - Clicking the "Fetch origin" button will fetch any commits to the current branch that anyone else has made and pushed to the cloud

9. To keep your code up to date with the original repository's main branch, open the "branch" menu at the top of the screen and click "Update from main". If some commits get pulled to your branch from main, you can push to update your branch in the cloud again.
    - Make sure to update your branch from main frequently! If you don't, you may have to resolve big conflicts between your changes and changes someone else made to main. If you encounter conflicts, just follow the prompts in GitHub Desktop to open the conflicts in VS Code and solve them there. Once all conflicts are resolved, switch back to GitHub Desktop to complete the merge.

10. Once you're satisfied enough with your set of changes to request to add them to the main website, and have committed all changes, checked for updates, and pushed all commits, create a pull request through the menu in the middle of GitHub Desktop. This will bring you to the website where you can describe the changes you made and want to pull to the website and assign an issue that it will fix. One of the internal contributors will review your pull request after you submit it and will either approve it and merge it with the main branch or make comments about things that need fixed before it can get merged.

To recap the contribution steps, do the combination of creating and publishing a branch, making changes and commits, updating from main, pushing commits, and creating a pull request.
