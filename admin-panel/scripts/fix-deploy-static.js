const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

const root = path.resolve(__dirname, '..');
const deployDir = path.join(root, 'deploy');

const src1 = path.join(deployDir, '_next', 'static'); // mevcut postbuild çıktın
const src2 = path.join(deployDir, 'build', 'static'); // bazı kurulumlarda burada da olabilir
const dst = path.join(deployDir, '.next', 'static'); // standalone runtime'ın beklediği yer

fse.ensureDirSync(path.join(deployDir, '.next'));

let copied = false;

if (fs.existsSync(src1)) {
  fse.removeSync(dst);
  fse.copySync(src1, dst);
  console.log('✅ fix-deploy-static: copied deploy/_next/static -> deploy/.next/static');
  copied = true;
} else if (fs.existsSync(src2)) {
  fse.removeSync(dst);
  fse.copySync(src2, dst);
  console.log('✅ fix-deploy-static: copied deploy/build/static -> deploy/.next/static');
  copied = true;
}

if (!copied) {
  console.log(
    '⚠️ fix-deploy-static: no static source found (deploy/_next/static or deploy/build/static)',
  );
  process.exitCode = 1;
}
