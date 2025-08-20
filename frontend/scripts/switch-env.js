#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mode = process.argv[2];

if (!mode || !['local', 'aws'].includes(mode)) {
  console.error('❌ 사용법: node scripts/switch-env.js [local|aws]');
  console.log('');
  console.log('예시:');
  console.log('  npm run env:local   # 로컬 Docker Compose 백엔드 사용');
  console.log('  npm run env:aws     # AWS 배포 백엔드 사용');
  process.exit(1);
}

const frontendDir = path.resolve(__dirname, '..');
const targetFile = path.join(frontendDir, '.env.development');
const sourceFile = mode === 'local' 
  ? path.join(frontendDir, '.env.development') 
  : path.join(frontendDir, '.env.development.aws');

try {
  // AWS 모드일 때만 파일 복사
  if (mode === 'aws') {
    if (!fs.existsSync(sourceFile)) {
      console.error(`❌ 파일을 찾을 수 없습니다: ${sourceFile}`);
      process.exit(1);
    }
    
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`✅ 환경 설정을 AWS 모드로 변경했습니다`);
    console.log(`   API: http://wherewego-prod-alb-1343640395.ap-northeast-2.elb.amazonaws.com/api`);
  } else {
    // local 모드: .env.development는 이미 로컬 설정이므로 메시지만 출력
    console.log(`✅ 환경 설정이 로컬 모드로 설정되어 있습니다`);
    console.log(`   API: http://localhost:8080/api`);
    console.log(`   💡 백엔드를 시작하세요:`);
    console.log(`      - Docker: npm run docker:up (또는 docker:full-up)`);
    console.log(`      - Gradle: ./gradlew bootRun`);
  }
  
  console.log('');
  console.log('🚀 프론트엔드 개발 서버를 시작하세요: npm run dev');
  
} catch (error) {
  console.error('❌ 환경 설정 변경 중 오류 발생:', error.message);
  process.exit(1);
}