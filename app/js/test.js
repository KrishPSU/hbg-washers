const socket = io();

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/service-worker.js')
//       .then(function(registration) {
//         console.log('Service Worker registered with scope:', registration.scope);
//       });
//   }


//   Notification.requestPermission().then(permission => {
//     if (permission === "granted") {
//       console.log("Notification permission granted.");
//     }
//   });




document.getElementById('enableNotifications').addEventListener('click', () => {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("Notifications allowed!");
        socket.emit('notis-enabled');
        // Proceed with subscription logic
      }
    });


    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
    
            // Ask for push notification permission after service worker is ready
            return Notification.requestPermission();
        })
        .then(function(permission) {
            if (permission === "granted") {
            console.log("User allowed push notifications!");
            // Here you would typically also subscribe to push service
            } else {
            console.log("User did not allow push notifications.");
            }
        })
        .catch(function(error) {
            console.log('Service Worker registration or permission request failed:', error);
        });
    }


    navigator.serviceWorker.ready.then(function(registration) {
        return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'BDkLN_ToX-Gk27oZGqRQ6Xd-sgZwzd8N0JKW-JGsBdSHKUuk4thSZbUck-z-DdJ1sGMwcbGQqlq4sjFcjYA-534'
        });
    }).then(function(subscription) {

        sub = subscription;

        console.log('Subscription:', subscription);
    
        socket.emit('notis-enabled', subscription);
    });
});

let sub;

document.getElementById('getNotified').addEventListener('click', () => {
    socket.emit('get-noti', sub);
});
