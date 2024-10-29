// options.js
document.addEventListener('DOMContentLoaded', () => {
    // Load saved options
    chrome.storage.sync.get({
        refreshDelay: 0,
        refreshCurrentWindowOnly: false,
        showNotifications: true,
        excludePinnedTabs: true
    }, (items) => {
        document.getElementById('refreshDelay').value = items.refreshDelay;
        document.getElementById('refreshCurrentWindowOnly').checked = items.refreshCurrentWindowOnly;
        document.getElementById('showNotifications').checked = items.showNotifications;
        document.getElementById('excludePinnedTabs').checked = items.excludePinnedTabs;
    });

    // Save options when changed
    const saveOptions = () => {
        const refreshDelay = parseInt(document.getElementById('refreshDelay').value) || 0;
        const refreshCurrentWindowOnly = document.getElementById('refreshCurrentWindowOnly').checked;
        const showNotifications = document.getElementById('showNotifications').checked;
        const excludePinnedTabs = document.getElementById('excludePinnedTabs').checked;

        chrome.storage.sync.set({
            refreshDelay,
            refreshCurrentWindowOnly,
            showNotifications,
            excludePinnedTabs
        }, () => {
            // Show saved message
            const saveStatus = document.getElementById('saveStatus');
            saveStatus.classList.add('visible');
            setTimeout(() => {
                saveStatus.classList.remove('visible');
            }, 1500);
        });
    };

    // Add change listeners to all inputs
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', saveOptions);
    });

    // Ask for permission to show notifications
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // Add event listener to test notifications
    document.getElementById('testNotification').addEventListener('click', () => {
        new Notification('Welcome to Tab Refresher!', {
            body: 'Thank you for using Tab Refresher. You will now receive notifications when tabs are refreshed.'
        });
    });


});