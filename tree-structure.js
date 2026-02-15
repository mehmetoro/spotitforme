// tree-structure.js
// Kullanım: node tree-structure.js [dizin]
// Örnek: node tree-structure.js app

const fs = require('fs');
const path = require('path');

// Komut satırı parametresini al
const targetDir = process.argv[2] || '.';
const rootPath = path.resolve(process.cwd(), targetDir);

// Görmezden gelinecek klasörler/dosyalar
const ignoreList = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.cache',
  'package-lock.json',
  'yarn.lock'
];

function getTreeStructure(dirPath, prefix = '', isLast = true, depth = 0) {
  if (depth > 10) return ''; // Derinlik limiti

  let result = '';
  const items = fs.readdirSync(dirPath)
    .filter(item => !ignoreList.includes(item))
    .sort((a, b) => {
      // Önce klasörler, sonra dosyalar
      const aIsDir = fs.statSync(path.join(dirPath, a)).isDirectory();
      const bIsDir = fs.statSync(path.join(dirPath, b)).isDirectory();
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

  items.forEach((item, index) => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    const isDirectory = stats.isDirectory();
    const isLastItem = index === items.length - 1;
    
    // Tree karakterleri
    const line = isLast ? '    ' : '│   ';
    const connector = isLastItem ? '└── ' : '├── ';
    
    // İkon ve isim
    const icon = isDirectory ? '📁' : '📄';
    result += prefix + connector + icon + ' ' + item + '\n';
    
    if (isDirectory) {
      result += getTreeStructure(
        itemPath, 
        prefix + line, 
        isLastItem,
        depth + 1
      );
    }
  });
  
  return result;
}

function main() {
  if (!fs.existsSync(rootPath)) {
    console.error(`Hata: "${targetDir}" dizini bulunamadı!`);
    process.exit(1);
  }

  const stats = fs.statSync(rootPath);
  const rootName = path.basename(rootPath);
  
  // Başlık
  const title = stats.isDirectory() ? '📁 ' + rootName : '📄 ' + rootName;
  const output = title + '\n' + 
    '='.repeat(50) + '\n' +
    getTreeStructure(rootPath) + '\n' +
    '='.repeat(50) + '\n' +
    `📊 Toplam: ${rootPath}`;

  // Dosyaya kaydet
  const outputFile = path.join(process.cwd(), `hiyerarsi-${targetDir.replace(/\//g, '-')}.txt`);
  fs.writeFileSync(outputFile, output, 'utf8');
  
  console.log(`✅ Hiyerarşi "${outputFile}" dosyasına kaydedildi.`);
  console.log(output);
}

main();