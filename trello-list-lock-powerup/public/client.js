/* global TrelloPowerUp */

// Helper to update the board-level locked list count
function updateLockedCount(t, delta) {
  return t.get('board', 'shared', 'lockedListCount')
    .then(function(count) {
      var newCount = Math.max(0, (count || 0) + delta);
      return t.set('board', 'shared', 'lockedListCount', newCount);
    });
}

// Initialize the Power-Up
TrelloPowerUp.initialize({
  // Add buttons to the board for showing lock status info
  'board-buttons': function(t) {
    return [{
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
  'list-actions': function(t) {
    return t.get('list', 'shared', 'isLocked')
      .then(function(isLocked) {
        if (isLocked) {
          return [{
            text: '🔓 Unlock List Title',
            callback: function(t) {
              return t.set('list', 'shared', 'isLocked', false)
                .then(function() {
                  return updateLockedCount(t, -1);
                })
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
          return [{
            text: '🔒 Lock List Title',
            callback: function(t) {
              return t.list('name')
                .then(function(list) {
                  return t.set('list', 'shared', {
                    'isLocked': true,
                    'originalName': list.name
                  });
                })
                .then(function() {
                  return updateLockedCount(t, 1);
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
  'list-badges': function(t) {
    return t.get('list', 'shared', 'isLocked')
      .then(function(isLocked) {
        if (isLocked) {
          return [{
            text: '🔒 Locked',
            color: 'red',
            title: 'This list title is locked and cannot be renamed'
          }];
        }
        return [];
      });
  },

  'on-enable': function(t) {
    console.log('List Lock Power-Up enabled');
  },

  'authorization-status': function(t) {
    return { authorized: true };
  },

  'show-authorization': function(t) {
    return t.popup({
      title: 'List Title Lock',
      url: './index.html'
    });
  }
}, {
  appName: 'List Title Lock'
});
