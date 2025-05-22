const express = require('express');
const path = require('path');
const multer = require('multer');
const fetch = require('node-fetch');
const cors = require('cors');
const FormData = require('form-data');

const app = express();
const upload = multer();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname))); // 静的HTML/JS読み込み

// 📄 フォーム画面表示（upload.htmlなど）
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'upload.html'));
});

// 🔁 Make中継エンドポイント
app.post('/relay', upload.any(), async (req, res) => {
  try {
    const formData = new FormData();

    // テキスト入力項目の転送
    formData.append('shoin_id', req.body.shoin_id || '');
    formData.append('seiri_no', req.body.seiri_no || '');
    formData.append('date', req.body.date || '');

    // ファイルの転送
    for (const file of req.files) {
      formData.append(file.fieldname, file.buffer, file.originalname);
    }

    // ✅ Make Webhook 実URL
    const makeWebhookURL = 'https://hook.us2.make.com/5h6de47sqqa6l4z2yf4rrd5plk6ekq2c';

    // Makeへ送信
    const response = await fetch(makeWebhookURL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const resultText = await response.text(); // ← Makeが返すHTMLまたは文字列

    if (response.ok) {
      res.status(200).send(resultText); // ← Webページに返す本文（チェック結果表示に使う）
    } else {
      res.status(response.status).send(`Make側エラー: ${resultText}`);
    }
  } catch (error) {
    console.error('中継エラー:', error);
    res.status(500).send('中継サーバー内部エラー');
  }
});

app.listen(port, () => {
  console.log(`中継サーバー起動中: http://localhost:${port}`);
});
