const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const cors = require('cors');
const FormData = require('form-data');

const app = express();
const upload = multer(); // メモリストレージ使用
app.use(cors());

app.post('/relay', upload.any(), async (req, res) => {
  try {
    const formData = new FormData();

    // 🔹 テキスト情報を追加（空文字で安全に処理）
    formData.append('shoin_id', req.body.shoin_id || '');
    formData.append('seiri_no', req.body.seiri_no || '');
    formData.append('date', req.body.date || '');

    // 🔹 ファイル情報をログで確認（デバッグ用）
    console.log('受信ファイル一覧:');
    req.files.forEach(file => {
      console.log(`- ${file.fieldname}: ${file.originalname} (${file.size} bytes)`);
    });

    // 🔹 ファイル（meisai, zumen等）を中継用FormDataに追加
    for (const file of req.files) {
      formData.append(file.fieldname, file.buffer, file.originalname);
    }

    // 🔹 Make Webhook先のURL
    const makeWebhookURL = 'https://hook.us2.make.com/7ya79qm3ttvxoq6taks4wvto37hrcfjb';

    // 🔹 MakeへPOST送信
    const response = await fetch(makeWebhookURL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const resultText = await response.text();

    if (response.ok) {
      console.log('✅ Make中継成功');
      res.status(200).send('中継完了');
    } else {
      console.error('❌ Make側エラー:', resultText);
      res.status(response.status).send(`Make側エラー: ${resultText}`);
    }
  } catch (error) {
    console.error('💥 中継サーバーエラー:', error);
    res.status(500).send('中継サーバー内部エラー');
  }
});

// 🔹 サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 中継サーバー起動中: http://localhost:${PORT}`);
});
