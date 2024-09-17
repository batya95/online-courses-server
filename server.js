const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());

function readJsonFile(filename) {
  const filePath = path.join(__dirname, filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
function saveUsers(users) {
    saveJsonFile('users.json', users);
}
  
let users = readJsonFile('users.json');
let courses = readJsonFile('courses.json');
let categories = readJsonFile('categories.json');
let lecturers = readJsonFile('lecturers.json');

app.get('/api/courses', (req, res) => {
    res.json(courses);
  });
  
  app.get('/api/courses/:id', (req, res) => {
    const courseId = parseInt(req.params.id);
    const course = courses.find(c => c.id === courseId);
    
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'הקורס לא נמצא' });
    }
  });
  
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/lecturers', (req, res) => {
  res.json(lecturers);
});
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  // חיפוש במערך המרצים
  user = lecturers.find(l => l.id === userId);
  
  if (user) {
    res.json({ ...user, role: 'lecturer' });
    return;
  }
  
  // אם המשתמש לא נמצא
  res.status(404).json({ message: 'משתמש לא נמצא' });
});

app.post('/api/add-course', (req, res) => {
  const newCourse = req.body;
  newCourse.id = courses.length + 1;
  courses.push(newCourse);
  saveJsonFile('courses.json', courses);
  res.status(201).json({ success: true, course: newCourse });
});



app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  let lecturers = readJsonFile('lecturers.json');

  // בדיקה אם המשתמש קיים (בין אם כמשתמש רגיל או כמרצה)
  const userExists = users.find(u => u.name === username) || lecturers.find(l => l.name === username);
  
  // בדיקה במערך המשתמשים הרגילים
  const user = users.find(u => u.name === username && u.password === password);
  
  if (user) {
    console.log("uuuuuuuuuu");
    res.json({ success: true, user, role: 'user' });
    return;
  }
  
  // בדיקה במערך המרצים
  const lecturer = lecturers.find(l => l.name === username && l.password === password);
  
  if (lecturer) {
    console.log("lllllllllllllll");
    res.json({ success: true, user: lecturer, role: 'lecturer' });
    return;
  }
  
  // אם המשתמש קיים אבל הסיסמה שגויה
  if (userExists) {
    res.status(401).json({ success: false, message: 'סיסמה שגויה', errorType: 'wrongPassword' });
  } else {
    // אם המשתמש לא קיים כלל
    res.status(404).json({ success: false, message: 'משתמש לא קיים', errorType: 'userNotFound' });
  }
});


app.post('/api/register', (req, res) => {
  const newUser = req.body;
  console.log('Received user data:', newUser); // לוג לבדיקה

  if (newUser.isLecturer) {
  //  let lecturers = readJsonFile('lecturers.json');
    if (lecturers.some(l => l.name === newUser.name)) {
      res.status(400).json({ success: false, message: 'שם המרצה כבר קיים' });
    } else {
      newUser.id = lecturers.length + 1;
      lecturers.push(newUser);
      saveJsonFile('lecturers.json', lecturers);
      res.json({ success: true, user: newUser });
    }
  } else {
    if (users.some(u => u.name === newUser.name)) {
      res.status(401).json({ success: false, message: 'שם המשתמש כבר קיים' });
    } else {
      newUser.id = users.length + 1;
      users.push(newUser);
      saveJsonFile('users.json', users);
      res.json({ success: true, user: newUser });
    }
  }
});

app.post('/api/verify-lecturer-code', (req, res) => {
  const { code } = req.body;
  console.log('Received code:');
  console.log(code); // לוג לבדיקה
  const validCode = '8787'; 
  res.json(code === validCode);
});

app.put('/api/courses/:id', (req, res) => {
  const courseId = parseInt(req.params.id);
  const courseIndex = courses.findIndex(c => c.id === courseId);
  if (courseIndex !== -1) {
    courses[courseIndex] = { ...courses[courseIndex], ...req.body };
    res.json(courses[courseIndex]);
  } else {
    res.status(404).json({ message: 'הקורס לא נמצא' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
