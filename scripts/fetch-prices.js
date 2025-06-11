const axios = require('axios');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const user = process.env.API_USER;
    const pass = process.env.API_PASS;
    if (!user || !pass) {
      throw new Error('Missing API credentials');
    }

    const url = `https://${process.env.DOMAIN || '<TU_DOMINIO>'}/api/products`;
    const response = await axios.get(url, {
      auth: {
        username: user,
        password: pass
      }
    });

    const outPath = path.join(__dirname, '..', 'public', 'productos.json');
    fs.writeFileSync(outPath, JSON.stringify(response.data, null, 2));
    console.log(`Saved data to ${outPath}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
