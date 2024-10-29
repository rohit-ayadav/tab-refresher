// background.js
let refreshInProgress = false;
let refreshDelay = 0; // Default delay between tab refreshes

// Listen for install/update events
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default options
    chrome.storage.sync.set({
      refreshDelay: 0,
      refreshCurrentWindowOnly: false,
      showNotifications: true,
      excludePinnedTabs: true
    });
  }
});

// Function to refresh tabs with progress tracking
async function refreshTabs() {
  if (refreshInProgress) {
    showNotification('Refresh already in progress', 'Please wait for the current refresh to complete.');
    return;
  }

  try {
    refreshInProgress = true;
    updateIcon(true);

    // Get settings
    const settings = await chrome.storage.sync.get({
      refreshDelay: 0,
      refreshCurrentWindowOnly: false,
      showNotifications: true,
      excludePinnedTabs: true
    });

    // Query for tabs based on settings
    const queryOptions = settings.refreshCurrentWindowOnly ? { currentWindow: true } : {};
    const tabs = await chrome.tabs.query(queryOptions);
    
    let refreshedCount = 0;
    const totalTabs = tabs.filter(tab => !settings.excludePinnedTabs || !tab.pinned).length;

    // Show start notification
    if (settings.showNotifications) {
      showNotification('Starting refresh', `Refreshing ${totalTabs} tabs...`);
    }

    // Refresh tabs with delay
    for (const tab of tabs) {
      if (settings.excludePinnedTabs && tab.pinned) {
        continue;
      }

      try {
        await chrome.tabs.reload(tab.id);
        refreshedCount++;
        
        // Update badge text with progress
        chrome.action.setBadgeText({
          text: Math.round((refreshedCount / totalTabs) * 100) + '%'
        });

        if (settings.refreshDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, settings.refreshDelay));
        }
      } catch (error) {
        console.error(`Error refreshing tab ${tab.id}:`, error);
      }
    }

    // Show completion notification
    if (settings.showNotifications) {
      showNotification('Refresh complete', `Successfully refreshed ${refreshedCount} tabs`);
    }
  } catch (error) {
    // console.error('Error during refresh:', error);
    showNotification('Error', 'An error occurred while refreshing tabs');
  } finally {
    refreshInProgress = false;
    updateIcon(false);
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
  }
}

// Helper function to show notifications
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message
  });
  // Hide notification after 5 seconds
  setTimeout(() => chrome.notifications.clear('', () => {}), 5000);

  // Log notification
  console.log(`${title}: ${message}`);

  
}

// Helper function to update extension icon
function updateIcon(isRefreshing) {
  const path = isRefreshing ? 'icons/icon_refresh.gif' : 'icons/icon128.png';
  chrome.action.setIcon({ path: path });
}

// Listen for extension button click
chrome.action.onClicked.addListener(async () => {
  const settings = await chrome.storage.sync.get(['refreshCurrentWindowOnly']);
  refreshTabs(settings.refreshCurrentWindowOnly);
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'refresh-all-tabs') {
    refreshTabs(false);
  } else if (command === 'refresh-current-window') {
    refreshTabs(true);
  }
});

// Open options page on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.openOptionsPage();
});
