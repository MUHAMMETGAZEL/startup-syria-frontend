const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname)));

// جميع الطلبات ترجع index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`الواجهة الأمامية تعمل على http://localhost:${PORT}`);
});