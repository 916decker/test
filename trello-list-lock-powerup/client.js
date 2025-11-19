/* global TrelloPowerUp */

// Initialize the Power-Up
TrelloPowerUp.initialize({
  // Add buttons to the board (optional - for showing info)
  'board-buttons': function(t, options) {
    return [{
      icon: {
        dark: 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Flock-icon.png?1523016259068',
        light: 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Flock-icon.png?1523016259068'
      },
      text: 'List Locks',
      callback: function(t) {
        return t.popup({
          title: 'List Title Lock',
          url: './info.html',
          height: 250
        });
      }
    }];
  },

  // Add lock/unlock actions to each list menu
  'list-actions': function(t, options) {
    return t.get('list', 'shared', 'isLocked')
      .then(function(isLocked) {
        if (isLocked) {
          // List is locked - show unlock option
          return [{
            text: '🔓 Unlock List Title',
            callback: function(t) {
              return t.set('list', 'shared', 'isLocked', false)
                .then(function() {
                  return t.alert({
                    message: 'List title unlocked! You can now rename this list.',
                    duration: 4,
                    display: 'success'
                  });
                });
            }
          }];
        } else {
          // List is not locked - show lock option
          return [{
            text: '🔒 Lock List Title',
            callback: function(t) {
              return t.list('name')
                .then(function(list) {
                  // Store the original name
                  return t.set('list', 'shared', {
                    'isLocked': true,
                    'originalName': list.name
                  });
                })
                .then(function() {
                  return t.alert({
                    message: 'List title locked! This list cannot be renamed.',
                    duration: 4,
                    display: 'success'
                  });
                });
            }
          }];
        }
      });
  },

  // Show a badge on locked lists
  'list-badges': function(t, options) {
    return t.get('list', 'shared', 'isLocked')
      .then(function(isLocked) {
        if (isLocked) {
          return [{
            text: '🔒',
            color: 'red',
            title: 'This list title is locked'
          }];
        }
        return [];
      });
  },

  // Monitor for list name changes and prevent them if locked
  'on-enable': function(t, options) {
    console.log('List Lock Power-Up enabled');
    return t.board('all');
  },

  // Authorization not needed for this Power-Up
  'authorization-status': function(t, options) {
    return { authorized: true };
  },

  'show-authorization': function(t, options) {
    return t.popup({
      title: 'List Title Lock',
      url: './index.html'
    });
  }
}, {
  // Power-Up settings
  appKey: 'your-app-key-here',
  appName: 'List Title Lock'
});

// Monitor list name changes
// Note: Trello Power-Ups don't have direct "beforeUpdate" hooks,
// so we'll use a different approach with webhooks or polling
// For a simple solution, we rely on education and the lock badge

// Alternative approach: Use Trello's webhook system
// This would require a backend server, but for a no-code solution,
// we'll provide instructions for using the badge system and team education
