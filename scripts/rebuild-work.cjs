// Re-encrypt a private HTML source using the existing portfolio password format.
// No dependencies: Node.js built-in crypto and filesystem modules only.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const repo = path.resolve(__dirname, '..');
const sourcePath = process.argv[2];
if (!sourcePath || !process.env.PORTFOLIO_PASSWORD) {
  console.error('Provide a private HTML source path and set PORTFOLIO_PASSWORD in your environment.');
  process.exit(1);
}
const resolvedSource = fs.realpathSync(sourcePath);
const relative = path.relative(repo, resolvedSource);
if (!relative.startsWith('..'+path.sep) && !path.isAbsolute(relative)) {
  throw new Error('Keep the decrypted source outside the public repository.');
}
const gatePath = path.join(repo, 'work.html');
const gate = fs.readFileSync(gatePath, 'utf8');
const match = gate.match(/const staticryptConfig=(\{.*?\});/s);
if (!match) throw new Error('Portfolio encryption configuration not found.');
const config = JSON.parse(match[1]);
let derived = process.env.PORTFOLIO_PASSWORD;
for (const [algorithm, rounds] of [['sha1',1000],['sha256',14000],['sha256',585000]]) {
  derived = crypto.pbkdf2Sync(derived, config.staticryptSaltUniqueVariableName, rounds, 32, algorithm).toString('hex');
}
const key = Buffer.from(derived,'hex');
const previous = config.staticryptEncryptedMsgUniqueVariableName;
const expected = crypto.createHmac('sha256',key).update(previous.slice(64)).digest('hex');
if (expected !== previous.slice(0,64)) throw new Error('Password does not authenticate the existing portfolio. No files changed.');
const source = fs.readFileSync(resolvedSource);
if (!source.toString('utf8').includes('<html')) throw new Error('Expected a complete HTML document.');
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-cbc',key,iv);
const encrypted = Buffer.concat([iv,cipher.update(source),cipher.final()]).toString('hex');
const signature = crypto.createHmac('sha256',key).update(encrypted).digest('hex');
const decipher = crypto.createDecipheriv('aes-256-cbc',key,iv);
const roundTrip = Buffer.concat([decipher.update(Buffer.from(encrypted.slice(32),'hex')),decipher.final()]);
if (!roundTrip.equals(source)) throw new Error('Encryption verification failed. No files changed.');
config.staticryptEncryptedMsgUniqueVariableName = signature+encrypted;
fs.writeFileSync(gatePath,gate.replace(match[0],()=>`const staticryptConfig=${JSON.stringify(config)};`));
console.log('Updated the protected portfolio and verified the decrypted HTML matches the private source.');
