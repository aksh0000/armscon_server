const Tesseract = require('tesseract.js');
const fs = require('fs');



// Call the main function and handle the result
payment_verification('ssws4.jpg')
  .then(result => {
    console.log("Verification result:", result);
  })
  .catch(err => {
    console.error("Error during verification:", err);
  });
