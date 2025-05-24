const express = require('express');
const path = require('path');
const multer = require('multer');
const fetch = require('node-fetch');
const cors = require('cors');
const FormData = require('form-data');

const app = express();
const upload = multer();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname))); // 静的ファイル読み込み

// 📄 ルートでindex.htmlを返す
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 🔁 /relayエンドポイントでMakeへ転送
app.post('/relay', upload.any(), async (req, res) => {
  try {
    const formData = new FormData();

    // テキスト入力の転送
    formData.append('shoin_id', req.body.shoin_id || '');
    formData.append('seiri_no', req.body.seiri_no || '');
    formData.append('date', req.body.date || '');

    // ファイルの転送（meisai, zumen対応）
    for (const file of req.files) {
      formData.append(file.fieldname, file.buffer, file.originalname);
    }

    // ✅ 指定のMake Webhook URLに送信
    const makeWebhookURL = 'https://hook.us2.make.com/5h6de47sqqa6l4z2yf4rrd5plk6ekq2c';

    const response = await fetch(makeWebhookURL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const resultText = await response.text();

    if (response.ok) {
      res.status(200).send(resultText);
    } else {
      res.status(response.status).send(`Make側エラー: ${resultText}`);
    }
  } catch (error) {
    console.error('中継サーバーエラー:', error);
    res.status(500).send('中継サーバー内部エラー');
  }
});

// 🚀 Render対応ポートで起動
app.listen(PORT, () => {
  console.log(`中継サーバー起動中: http://localhost:${PORT}`);
});
