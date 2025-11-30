// docs/javascripts/dir_overrides.js

// 1. Define the logic in a standalone function
function applyDirectoryOverrides() {
    var path = window.location.pathname;
    console.log("Applying Directory Overrides for path:", path); // DEBUG LOG

    // --- CONFIGURATION ---
    var config = {
        "expandNavigation":      ["/learning-course/", "/website-feature-guide/"],
        "hideTableOfContents":   ["/learning-course/", "/website-feature-guide/"]
    };

    // --- LOGIC ---
    
    // Feature A: Expand Navigation
    // We check if the current path contains any of the target directories
    if (config.expandNavigation.some(function(dir) { return path.indexOf(dir) !== -1; })) {
        var sidebar = document.querySelector(".md-sidebar--primary");
        if (sidebar) {
            console.log(" -> Expanding Sidebar"); // DEBUG LOG
            var collapsedItems = sidebar.querySelectorAll("details");
            collapsedItems.forEach(function(item) {
                // Force the item open
                item.setAttribute("open", "");
                // Optional: Allow the theme to register the change if needed
                item.open = true;
            });
        }
    }

    // Feature B: Hide Table of Contents
    if (config.hideTableOfContents.some(function(dir) { return path.indexOf(dir) !== -1; })) {
        var tocSidebar = document.querySelector(".md-sidebar--secondary");
        if (tocSidebar) {
            console.log(" -> Hiding TOC"); // DEBUG LOG
            tocSidebar.style.display = "none";
        }
        // Stretch main content to fill space
        var content = document.querySelector(".md-content");
        if (content) {
            content.style.maxWidth = "100%";
        }
    }
}

// 2. Run immediately (for the initial page load)
applyDirectoryOverrides();

// 3. Subscribe to "Instant Navigation" updates
// This ensures the script re-runs every time you click a link
if (window.document$) {
    window.document$.subscribe(function() {
        applyDirectoryOverrides();
    });
}