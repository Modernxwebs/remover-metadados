// scripts/submit-indexnow.js
// Submits all site URLs to Bing & Yandex via the IndexNow API protocol

const host = 'remover-metadados.com';
const key = 'c942e18fbf764f69919b52a4e287a931';
const keyLocation = `https://${host}/${key}.txt`;

const urlList = [
  `https://${host}/`,
  `https://${host}/en/`,
  `https://${host}/guias/`,
  `https://${host}/guias/remover-metadados-de-imagem/`,
  `https://${host}/guias/remover-metadados-de-video/`,
  `https://${host}/guias/remover-metadados-pdf/`,
  `https://${host}/sobre/`,
  `https://${host}/contato/`,
  `https://${host}/privacidade/`,
  `https://${host}/termos/`,
  `https://${host}/en/about/`,
  `https://${host}/en/contact/`,
  `https://${host}/en/privacy/`,
  `https://${host}/en/terms/`,
];

async function submitIndexNow() {
  console.log(`Submitting ${urlList.length} URLs to IndexNow for ${host}...`);

  const payload = {
    host,
    key,
    keyLocation,
    urlList,
  };

  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`✓ Success: IndexNow accepted the URLs (HTTP ${response.status}).`);
    } else {
      console.warn(`IndexNow responded with status HTTP ${response.status}: ${response.statusText}`);
      const text = await response.text();
      if (text) console.warn(text);
    }
  } catch (err) {
    console.error('Failed to submit URLs to IndexNow:', err.message);
  }
}

submitIndexNow();
