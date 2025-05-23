window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const result = document.getElementById('result');
    result.innerHTML = '<span class="loading-dots">AIがチェック中です</span>';

    const shoinId = document.getElementById('shoin_id').value.trim();
    const seiriNo = document.getElementById('seiri_no').value.trim();
    const meisaishoFile = document.getElementById('meisaisho_file').files[0];
    const zumenFile = document.getElementById('zumen_file').files[0];

    if (!shoinId || !seiriNo || !meisaishoFile) {
      alert('❗ 必須項目（所員ID・整理番号・明細書ファイル）をすべて入力してください。');
      result.innerHTML = ''; // 入力不備なら表示リセット
      return;
    }

    const formData = new FormData();
    formData.append('shoin_id', shoinId);
    formData.append('seiri_no', seiriNo);
    formData.append('meisaisho_file', meisaishoFile);
    if (zumenFile) formData.append('zumen_file', zumenFile);
    formData.append('date', new Date().toISOString().slice(0, 10)); // 今日の日付（自動）

    try {
      const response = await fetch('/relay', {
        method: 'POST',
        body: formData
      });

      const resultText = await response.text();

      if (response.ok) {
        result.innerHTML = resultText
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\\n/g, '<br>')
          .replace(/\n/g, '<br>');
      } else {
        result.innerHTML = `❌ エラーが発生しました（Make側）:<br>${resultText}`;
      }
    } catch (error) {
      console.error('通信エラー:', error);
      result.innerHTML = '⚠️ ネットワークエラーが発生しました。再度お試しください。';
    }
  });
});
