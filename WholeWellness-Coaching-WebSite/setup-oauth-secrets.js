// Quick setup script for OAuth secrets
import fs from 'fs';

const oauth_credentials = {
  "client_id": "69500810131-qbh0549lkmau91vmihq0c757407lk5ba.apps.googleusercontent.com",
  "client_secret": "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",
  "project_id": "cs-poc-k77ipag8tpu1btarbnhsj3d",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "authorized_origins": [
    "https://wholewellnesscoaching.org",
    "https://wholewellnesscoaching.org"
  ]
};

console.log('🔧 OAuth Credentials Ready');
console.log('Client ID:', oauth_credentials.client_id);
console.log('Client Secret:', oauth_credentials.client_secret.substring(0, 20) + '...');
console.log('');
console.log('🚀 Next Steps:');
console.log('1. Go to: https://developers.google.com/oauthplayground');
console.log('2. Use your OAuth credentials');
console.log('3. Select Gmail API scope: https://mail.google.com/');
console.log('4. Get refresh token');
console.log('5. Add to Replit Secrets: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN');
console.log('');
console.log('📧 Email system will automatically use OAuth when these secrets are available!');