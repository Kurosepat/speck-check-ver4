window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const shoinId = document.getElementById('shoin_id').value.trim();
    const seiriNo = document.getElementById('seiri_no').value.trim();
    const meisaishoFile = document.getElementById('meisaisho_file').files[0];
    const zumenFile = document.getElementById('zumen_file').files[0];

    if (!shoinId || !seiriNo || !meisaishoFile) {
      alert('❗ 必須項目（所員ID・整理番号・明細書ファイル）をすべて入力してください。');
      result.innerHTML = '';
      return;
    }

    const formData = new FormData();
    formData.append('shoin_id', shoinId);
    formData.append('seiri_no', seiriNo);
    formData.append('meisai', meisaishoFile); // ✅ 正しいキー名
    if (zumenFile) formData.append('zumen', zumenFile); // ✅ 正しいキー名
    formData.append('date', new Date().toISOString().slice(0, 10));

    try {
      const response = await fetch('/relay', {
        method: 'POST',
        body: formData
      });

      const resultText = await response.text();

      if (response.ok) {
       window.location.href = "https://kurosepat.github.io/spec-check-ver4/result.html?result=" + encodeURIComponent(resultText);
      } 
      else {
       `❌ エラーが発生しました（Make側）:<br>${resultText}`;
      }
    } catch (error) {
      console.error('通信エラー:', error);
      '⚠️ ネットワークエラーが発生しました。再度お試しください。';
    }
  });
});
