const http = require('http');
const app = require('../server/app');

async function runTests() {
  console.log('--- Starting Integration & Auth Tests ---');
  
  // Start server on an ephemeral port
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    // 1. Health check
    console.log('\n[1] Testing Health Check...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    if (healthRes.status !== 200 || healthJson.status !== 'ok') {
      throw new Error(`Health check failed: ${JSON.stringify(healthJson)}`);
    }
    console.log('✔ Health check OK');

    // 2. Unauthenticated access to products should fail (401)
    console.log('\n[2] Testing Protected Product Route Without Token...');
    const unauthRes = await fetch(`${baseUrl}/api/products`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized without token, got ${unauthRes.status}`);
    }
    console.log('✔ Correctly denied access to unauthenticated request (401)');

    // 3. Register a new user
    console.log('\n[3] Testing User Registration...');
    const testEmail = `testuser_${Date.now()}@example.com`;
    const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Tester',
        email: testEmail,
        password: 'SecurePassword123!'
      })
    });
    const registerJson = await registerRes.json();
    if (registerRes.status !== 201 || !registerJson.token || !registerJson.user) {
      throw new Error(`Registration failed: ${JSON.stringify(registerJson)}`);
    }
    console.log(`✔ User registered successfully: "${registerJson.user.name}" (${registerJson.user.email})`);
    const userToken = registerJson.token;

    // 4. Duplicate registration should fail (409)
    console.log('\n[4] Testing Duplicate Registration Prevention...');
    const duplicateRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate User',
        email: testEmail,
        password: 'AnotherPassword123!'
      })
    });
    if (duplicateRes.status !== 409) {
      throw new Error(`Expected 409 Conflict for duplicate email, got ${duplicateRes.status}`);
    }
    console.log('✔ Correctly prevented duplicate user registration (409)');

    // 5. Login with invalid password should fail (401)
    console.log('\n[5] Testing Login with Wrong Password...');
    const wrongLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword!'
      })
    });
    if (wrongLoginRes.status !== 401) {
      throw new Error(`Expected 401 for wrong password, got ${wrongLoginRes.status}`);
    }
    console.log('✔ Correctly rejected wrong password (401)');

    // 6. Login with correct password
    console.log('\n[6] Testing User Login...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassword123!'
      })
    });
    const loginJson = await loginRes.json();
    if (loginRes.status !== 200 || !loginJson.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginJson)}`);
    }
    console.log('✔ User logged in successfully, received valid JWT');

    // 7. Verify Profile (GET /api/auth/me)
    console.log('\n[7] Testing GET /api/auth/me...');
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const meJson = await meRes.json();
    if (meRes.status !== 200 || meJson.user.email !== testEmail) {
      throw new Error(`Profile fetch failed: ${JSON.stringify(meJson)}`);
    }
    console.log(`✔ Fetched current user profile: ${meJson.user.name}`);

    // 8. CRUD Product with authenticated user
    console.log('\n[8] Testing Authenticated Product Creation...');
    const newProduct = {
      name: 'Authenticated Mechanical Numpad',
      price: 34.50,
      quantity: 18
    };
    const postRes = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(newProduct)
    });
    const postJson = await postRes.json();
    if (postRes.status !== 201 || postJson.data.name !== newProduct.name) {
      throw new Error(`Create product failed: ${JSON.stringify(postJson)}`);
    }
    const productId = postJson.data.id;
    console.log(`✔ Created product ID #${productId} for user`);

    // 9. Update Product
    console.log('\n[9] Testing Authenticated Product Update...');
    const putRes = await fetch(`${baseUrl}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Authenticated Mechanical Numpad RGB',
        price: 39.99,
        quantity: 25
      })
    });
    const putJson = await putRes.json();
    if (putRes.status !== 200 || putJson.data.price !== 39.99) {
      throw new Error(`Update product failed: ${JSON.stringify(putJson)}`);
    }
    console.log(`✔ Updated product ID #${productId}`);

    // 10. Delete Product
    console.log('\n[10] Testing Authenticated Product Deletion...');
    const delRes = await fetch(`${baseUrl}/api/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const delJson = await delRes.json();
    if (delRes.status !== 200 || !delJson.success) {
      throw new Error(`Delete product failed: ${JSON.stringify(delJson)}`);
    }
    console.log(`✔ Deleted product ID #${productId}`);

    // 11. Static files test (Login, Register, Dashboard)
    console.log('\n[11] Testing Static HTML Pages (login, register, dashboard)...');
    const loginHtmlRes = await fetch(`${baseUrl}/login.html`);
    const regHtmlRes = await fetch(`${baseUrl}/register.html`);
    const indexHtmlRes = await fetch(`${baseUrl}/index.html`);

    if (loginHtmlRes.status !== 200 || regHtmlRes.status !== 200 || indexHtmlRes.status !== 200) {
      throw new Error('Static HTML delivery failed');
    }
    console.log('✔ All static pages (login.html, register.html, index.html) served properly');

    console.log('\n🎉 ALL AUTHENTICATION & CRUD INTEGRATION TESTS PASSED! 🎉\n');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
