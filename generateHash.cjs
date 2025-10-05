const bcrypt = require('bcryptjs');
const passwordToHash = 'admin'; // You can change this to any password you want

console.log(`Generating a hash for the password: "${passwordToHash}"`);

bcrypt.hash(passwordToHash, 10, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
    } else {
        console.log('\n--- HASH GENERATED SUCCESSFULLY ---');
        console.log('Copy the hash below and use it in your SQL command:\n');
        console.log(hash);
        console.log('\n------------------------------------');
    }
});