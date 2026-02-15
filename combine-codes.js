// combine-codes.js
// Kullanım: node combine-codes.js [dizin]
// Örnek: node combine-codes.js app

const fs = require('fs');
const path = require('path');

// Komut satırı parametresini al
const targetDir = process.argv[2];
if (!targetDir) {
  console.error('Hata: Lütfen bir dizin adı girin!');
  console.error('Kullanım: node combine-codes.js [dizin]');
  console.error('Örnek: node combine-codes.js app');
  process.exit(1);
}

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
  'yarn.lock',
  '.env',
  '.env.local'
];

// Sadece bu uzantılı dosyaları al
const allowedExtensions = [
  '.ts', '.tsx', '.js', '.jsx',  // React/Next.js
  '.css', '.scss', '.sass',       // Stil dosyaları
  '.html', '.json',                // Diğer
  '.txt'                           // Metin dosyaları
];

let fileCount = 0;
let totalSize = 0;

function getAllFiles(dirPath, baseDir = dirPath) {
  let results = [];
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    if (ignoreList.includes(item)) continue;
    
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      results = results.concat(getAllFiles(itemPath, baseDir));
    } else {
      const ext = path.extname(item).toLowerCase();
      if (allowedExtensions.includes(ext)) {
        const relativePath = path.relative(baseDir, itemPath);
        results.push({
          path: itemPath,
          relativePath: relativePath,
          size: stats.size
        });
      }
    }
  }
  
  return results;
}

function combineCodes() {
  if (!fs.existsSync(rootPath)) {
    console.error(`Hata: "${targetDir}" dizini bulunamadı!`);
    process.exit(1);
  }

  const stats = fs.statSync(rootPath);
  if (!stats.isDirectory()) {
    console.error(`Hata: "${targetDir}" bir dizin değil!`);
    process.exit(1);
  }

  console.log(`📂 "${targetDir}" dizini taranıyor...`);
  const files = getAllFiles(rootPath);
  
  if (files.length === 0) {
    console.log('❌ Kod dosyası bulunamadı.');
    return;
  }

  // Çıktı dosyası
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const outputFile = path.join(process.cwd(), `${targetDir}-kodlari-${timestamp}.txt`);
  
  let output = '';
  let currentContent = '';
  let totalLines = 0;

  // Başlık
  output += '='.repeat(80) + '\n';
  output += `📦 ${targetDir.toUpperCase()} DİZİNİ - TÜM KOD DOSYALARI\n`;
  output += `📅 ${new Date().toLocaleString('tr-TR')}\n`;
  output += `📊 Toplam Dosya: ${files.length}\n`;
  output += '='.repeat(80) + '\n\n';

  // Her dosyayı işle
  files.forEach((file, index) => {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      const lines = content.split('\n').length;
      totalLines += lines;
      fileCount++;
      totalSize += file.size;

      // Dosya ayracı
      output += '\n' + '─'.repeat(80) + '\n';
      output += `📄 ${file.relativePath}\n`;
      output += `📊 ${lines} satır | ${(file.size / 1024).toFixed(2)} KB\n`;
      output += '─'.repeat(80) + '\n\n';
      
      // Dosya içeriği
      output += content + '\n';
      
      // İlerleme göster
      if ((index + 1) % 10 === 0) {
        console.log(`📊 ${index + 1}/${files.length} dosya işlendi...`);
      }

    } catch (error) {
      output += `\n❌ HATA: ${file.relativePath} okunamadı: ${error.message}\n`;
    }
  });

  // Özet
  output += '\n' + '='.repeat(80) + '\n';
  output += '📊 ÖZET BİLGİLER\n';
  output += '='.repeat(80) + '\n';
  output += `📁 Dizin: ${targetDir}\n`;
  output += `📄 Toplam Dosya: ${fileCount}\n`;
  output += `📊 Toplam Satır: ${totalLines.toLocaleString('tr-TR')}\n`;
  output += `💾 Toplam Boyut: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`;
  output += `📅 Oluşturulma: ${new Date().toLocaleString('tr-TR')}\n`;
  output += '='.repeat(80) + '\n';

  // Dosyaya yaz
  fs.writeFileSync(outputFile, output, 'utf8');
  
  console.log('\n' + '✅ İşlem Tamamlandı!');
  console.log('='.repeat(50));
  console.log(`📁 Dizin: ${targetDir}`);
  console.log(`📄 Dosya Sayısı: ${fileCount}`);
  console.log(`📊 Toplam Satır: ${totalLines.toLocaleString('tr-TR')}`);
  console.log(`💾 Toplam Boyut: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📄 Çıktı Dosyası: ${outputFile}`);
  console.log('='.repeat(50));
}

combineCodes();