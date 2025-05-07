self.addEventListener('push', function(event) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: './images/favicon.png',
      badge: './images/favicon.png'
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });
