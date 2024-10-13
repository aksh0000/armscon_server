const express = require('express');
const http = require('http');
const mysql = require('mysql');
const path = require('path')
const app = express();
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Tesseract = require('tesseract.js');
// Middleware Setup
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// MySQL Connection (Connect once globally)
var con = mysql.createConnection({
  host: 'database-1.cfes600acmp1.eu-north-1.rds.amazonaws.com',
  user: 'admin',
  password: '##QazWsxEdc$$123',
  database: 'database-1',
  port: 3306
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database.");
});

// Set up multer storage for file handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'dp') {
      cb(null, './downloads');
    } else if (file.fieldname === 'screenshot') {
      cb(null, './screenshots');
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.get('/int',(req,res)=>{
  res.write("Working just fine! with AWS!");
  res.end();
})
// Signup Route
app.post('/signup', upload.fields([{ name: 'dp', maxCount: 1 }, { name: 'screenshot', maxCount: 1 }]), (req, res) => {
  try {
    const user_data = JSON.parse(req.body.user_data);
    const fullname = user_data.personInfo.fullname;
    const phonenumber = user_data.personInfo.phoneNumber;
    const email = user_data.personInfo.email;
    const college = user_data.personInfo.collge;
    const course = user_data.personInfo.course;
    const year = user_data.personInfo.year;
    const plan = user_data.plans.plans;
    const half_day_workshops = user_data.plans.halfday_workshops;
    const full_day_workshops = user_data.plans.fullday_workshops;
    const dp_name = req.files['dp'] ? req.files['dp'][0].originalname : '';
    const screenshot_name = req.files['screenshot'] ? req.files['screenshot'][0].originalname : '';

    // SQL Insert Query
    const sql = `INSERT INTO users (fullname, phonenumber, email, college, year, course, plan, half_day_workshops, full_day_workshops, dp, screenshot)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [fullname, phonenumber, email, college, year, course, plan, half_day_workshops, full_day_workshops, dp_name, screenshot_name];
    payment_verification(req.files['screenshot'][0].originalname)
        .then(result => {
          
          if(result==true){
            con.query(sql, values, (err, result) => {
              if (err) {
                console.error('Error inserting user data:', err);
                return res.status(500).json({ error: 'Failed to insert user data' });
              }
              console.log("1 record inserted", req.files['screenshot'][0].originalname);
              
              res.status(200).json({ message: 'Signup successful', insertedId: result.insertId });
            });
          }
          else{
            res.status(200).json({ message: 'This Screen Shot Has already been used before Try again!', insertedId: result.insertId });
          }
        })
        .catch(err => {
          console.error("Error during verification:", err);
        });
    
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(400).json({ error: 'Invalid user data provided' });
  }
});

// Login Route
app.post("/login", (req, res) => {
  const { fullname, phonenumber } = req.body;

  const query = 'SELECT * FROM users WHERE fullname = ? AND phonenumber = ?';
  con.query(query, [fullname, phonenumber], (err, results) => {
    if (err) {
      console.error('Error querying user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create a JWT token
    const token = jwt.sign({ userData: results[0] }, "$QazWsxEdc@123", { expiresIn: '1h' });
    console.log(results)
    res.status(200).json({ message: 'Login successful', token });
  });
});

// Protected Route - Dashboard
app.get("/dashboard", (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, "$QazWsxEdc@123", (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const imagePath = `./downloads/${user.userData.dp}`;
    let url
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        console.log('Error reading file:', err);
        return res.status(404).json({ error: 'Image not found' });
      }

      // Convert binary data to base64 string
      const base64Image = Buffer.from(data).toString('base64');
      const mimeType = path.extname(imagePath).substring(1); // Extract the MIME type (e.g., jpg or png)
      let urli = `data:image/${mimeType};base64,${base64Image}`
      // Send the base64 image string as the response
      //res.json({ base64: `data:image/${mimeType};base64,${base64Image}` });
      res.status(200).json({ data_to_rec: user.userData, dp: urli });
    });



  });
});


// Main function that initiates the payment verification process
async function payment_verification(path) {
  const imagePath = './screenshots/' + path;

  try {
    // Use await to get the recognized text from the image
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: info => console.log(info) // Log progress if desired
      }
    );

    // Get the result from payment gateway processing
    return await get_payment_gateway(text);
  } catch (err) {
    console.error("Error:", err);
    return false;
  }
}

// Function to process the recognized text and identify the payment gateway
async function get_payment_gateway(text) {
  const array_of_words = text.split("\n");

  if (array_of_words.some(line => line.includes("PAYMENT SUCCESSFUL"))) {
    return await paytm(array_of_words);
  } else if (array_of_words.some(line => line.includes("Paid to"))) {
    return await gpay(array_of_words, 1);
  } else if (array_of_words.some(line => line.includes("Google transaction ID"))) {
    return await gpay(array_of_words, 2);
  } else {
    console.log("PhonePe");
    return false;
  }
}

// Function to handle GPay logic and check UPI transaction ID
async function gpay(text, type_of_image) {
  let upi_trans_id;
  if (type_of_image === 1) {
    const upi_transaction_id_index = text.findIndex(item => item.includes("UPI transaction ID"));
    const upi_trans_id_parts = text[upi_transaction_id_index].split(" ");
    upi_trans_id = upi_trans_id_parts[3];
  } else {
    const upi_transaction_id_index = text.findIndex(item => item.includes("UPI transaction ID"));
    upi_trans_id = text[upi_transaction_id_index + 1];
  }
  console.log(upi_trans_id);
  return await check_upi_trans_id(upi_trans_id);
}

// Function to handle Paytm logic and check UPI transaction ID
async function paytm(text) {
  const upi_transaction_id_index = text.findIndex(item => item.includes("UPI Ref ID"));
  const upi_trans_id_parts = text[upi_transaction_id_index].split(" ");
  const upi_trans_id = upi_trans_id_parts[3];
  console.log(upi_trans_id);
  return await check_upi_trans_id(upi_trans_id);
}

// Function to check UPI transaction ID in the file and log/save if needed
function check_upi_trans_id(upi_trans_id) {
  return new Promise((resolve, reject) => {
    fs.readFile("upi_trans_id.txt", 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const all_ids = data.split('\n');
      console.log(data);

      if (all_ids.includes(upi_trans_id)) {
        console.log("ALREADY EXISTS!");
        resolve(false);
      } else {
        console.log("First time entry!");
        fs.appendFile('upi_trans_id.txt', '\n' + upi_trans_id, function (err) {
          if (err) {
            reject(err);
          } else {
            console.log('Saved!');
            resolve(true);
          }
        });
      }
    });
  });
}
app.listen(process.env.PORT, () => {
  console.log('Server running on http://localhost:8000');
});
