let deferredPrompt;
let buttonInstall = document.getElementById("install")
buttonInstall.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  buttonInstall.style.display = 'block';

  buttonInstall.addEventListener('click', (e) => {
    // hide our user interface that shows our A2HS button
    buttonInstall.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
      });
  });
});

// function showInstallPromotion() {
//   buttonInstall.style.filter = "brightness(1)"
//   console.log("install promotion on")
//   buttonInstall.addEventListener('click', (e) => {
//     // Hide the app provided install promotion
//     hideMyInstallPromotion();
//     // Show the install prompt
//     deferredPrompt.prompt();
//     // Wait for the user to respond to the prompt
//     deferredPrompt.userChoice.then((choiceResult) => {
//       if (choiceResult.outcome === 'accepted') {
//         console.log('User accepted the install prompt');
//       } else {
//         console.log('User dismissed the install prompt');
//       }
//     })
//   });
// }

// function hideMyInstallPromotion() {
//   buttonInstall.style.filter = "brightness(0.5)"
// }

// window.addEventListener('beforeinstallprompt', (e) => {
//   // Prevent the mini-infobar from appearing on mobile
//   e.preventDefault();
//   // Stash the event so it can be triggered later.
//   deferredPrompt = e;
//   // Update UI notify the user they can install the PWA
//   showInstallPromotion();
// });

