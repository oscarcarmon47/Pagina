const fs = require('fs');
const axios = require('axios');

(async () => {
  try {
    const res = await axios.get(process.env.API_URL, {
      auth: {
        username: process.env.API_USER,
        password: process.env.API_PASS
      }
    });
    fs.writeFileSync(
      'public/products.json',
      JSON.stringify(res.data, null, 2),
      'utf-8'
    );
    console.log('public/products.json actualizado');
  } catch (err) {
    console.error('Error al obtener productos:', err.message);
    process.exit(1);
  }
})();
