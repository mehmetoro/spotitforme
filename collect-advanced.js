#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.clear();
console.log('🔍 SPOTITFORME - Advanced Dependency Collector\n');

const PROJECT_ROOT = process.cwd();
const TARGET_FILE = process.argv[2] || 'app/products/[id]/page.tsx';

if (!TARGET_FILE) {
  console.log('Kullanım: node collect.js <dosya-yolu>');
  process.exit(1);
}

// Toplanan dosyalar
const collected = new Map(); // path -> content
const visited = new Set();
const importCache = new Map();

// Path utilities
function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

function resolvePath(importPath, fromFile) {
  const fromDir = path.dirname(fromFile);
  
  // Alias'ları çöz
  if (importPath.startsWith('@/')) {
    importPath = importPath.replace('@/', '');
    return path.join(PROJECT_ROOT, importPath);
  }
  
  // Relative import
  if (importPath.startsWith('.')) {
    return path.resolve(fromDir, importPath);
  }
  
  // Absolute (proje içi)
  if (importPath.startsWith('/')) {
    return path.join(PROJECT_ROOT, importPath);
  }
  
  return null;
}

// Dosya var mı kontrol et (tüm uzantıları dene)
function findFile(filePath) {
  // Direkt varsa
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  
  // Uzantıları dene
  const extensions = ['.ts', '.tsx', '.js', '.jsx', ''];
  for (const ext of extensions) {
    if (fs.existsSync(filePath + ext)) {
      return filePath + ext;
    }
  }
  
  // index dosyası olabilir
  for (const ext of extensions) {
    const indexPath = path.join(filePath, 'index' + ext);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }
  
  // Components klasöründe ara
  const possiblePaths = [
    filePath,
    path.join(path.dirname(filePath), 'components', path.basename(filePath)),
    path.join(PROJECT_ROOT, 'components', path.basename(filePath)),
    path.join(PROJECT_ROOT, 'components', path.basename(filePath, path.extname(filePath))),
  ];
  
  for (const testPath of possiblePaths) {
    // Uzantıları dene
    for (const ext of extensions) {
      const testPathWithExt = testPath + ext;
      if (fs.existsSync(testPathWithExt)) {
        return testPathWithExt;
      }
    }
  }
  
  return null;
}

// Bir dosyadaki tüm import'ları bul
function extractImports(fileContent) {
  const imports = new Set();
  
  // 1. Statik import'lar: import ... from '...'
  const staticImportRegex = /import\s+(?:[\w\s{},*]*?)\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = staticImportRegex.exec(fileContent)) !== null) {
    imports.add(match[1]);
  }
  
  // 2. Dynamic import'lar: import('...')
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicImportRegex.exec(fileContent)) !== null) {
    imports.add(match[1]);
  }
  
  // 3. require() çağrıları
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(fileContent)) !== null) {
    imports.add(match[1]);
  }
  
  // 4. Next.js özel import'ları (getServerSideProps vs)
  const nextImportRegex = /getServerSideProps|getStaticProps|getStaticPaths/;
  if (nextImportRegex.test(fileContent)) {
    imports.add('next');
  }
  
  return Array.from(imports);
}

// JSX component'lerini bul
function extractComponents(fileContent) {
  const components = new Set();
  const jsxRegex = /<([A-Z][A-Za-z0-9]*)(?:\s|>)/g;
  let match;
  
  while ((match = jsxRegex.exec(fileContent)) !== null) {
    components.add(match[1]);
  }
  
  return Array.from(components);
}

// Bir dosyayı ve bağımlılıklarını recursive olarak topla
async function collectFile(filePath, depth = 0, maxDepth = 15) {
  if (depth > maxDepth) {
    console.warn(`⚠️  Maksimum derinlik: ${filePath}`);
    return;
  }
  
  const normalized = normalizePath(path.resolve(filePath));
  
  if (visited.has(normalized)) {
    return;
  }
  
  visited.add(normalized);
  
  // Dosya var mı kontrol et
  let actualPath = findFile(normalized);
  if (!actualPath) {
    console.warn(`⚠️  Dosya bulunamadı: ${normalized}`);
    return;
  }
  
  // Dosyayı oku
  let content;
  try {
    content = fs.readFileSync(actualPath, 'utf-8');
  } catch (err) {
    console.warn(`⚠️  Okunamadı: ${actualPath}`);
    return;
  }
  
  // Dosyayı koleksiyona ekle
  collected.set(actualPath, content);
  console.log(`${'  '.repeat(depth)}📄 ${path.relative(PROJECT_ROOT, actualPath)}`);
  
  // Import'ları bul
  const imports = extractImports(content);
  const components = extractComponents(content);
  
  // Her import için recursive olarak devam et
  for (const imp of imports) {
    // External modülleri yoksay (npm paketleri)
    if (imp.startsWith('react') || 
        imp.startsWith('next/') ||
        imp.startsWith('lucide-react') ||
        imp.startsWith('@supabase/') ||
        imp.includes('/') && !imp.startsWith('.') && !imp.startsWith('@/') && !imp.startsWith('/')) {
      continue;
    }
    
    // Import path'ini çöz
    const resolved = resolvePath(imp, actualPath);
    if (resolved) {
      await collectFile(resolved, depth + 1, maxDepth);
    }
  }
  
  // Component'ler için de ara (büyük harfle başlayanlar)
  for (const component of components) {
    // Built-in HTML tag'leri yoksay
    const htmlTags = ['div', 'span', 'button', 'input', 'form', 'img', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    if (htmlTags.includes(component.toLowerCase())) {
      continue;
    }
    
    // Component dosyasını ara
    const possiblePaths = [
      path.join(path.dirname(actualPath), `${component}`),
      path.join(path.dirname(actualPath), 'components', `${component}`),
      path.join(PROJECT_ROOT, 'components', `${component}`),
      path.join(PROJECT_ROOT, 'app', `${component}`),
    ];
    
    for (const testPath of possiblePaths) {
      const found = findFile(testPath);
      if (found && !visited.has(normalizePath(found))) {
        console.log(`${'  '.repeat(depth + 1)}🔍 Component: ${component} -> ${path.relative(PROJECT_ROOT, found)}`);
        await collectFile(found, depth + 1, maxDepth);
        break;
      }
    }
  }
}

// Sonuçları TXT'ye yaz
function writeOutput() {
  let output = '';
  
  output += '='.repeat(80) + '\n';
  output += '📦 SPOTITFORME - TAM BAĞIMLILIK RAPORU\n';
  output += '='.repeat(80) + '\n\n';
  output += `🎯 HEDEF DOSYA: ${TARGET_FILE}\n`;
  output += `📅 Oluşturulma: ${new Date().toLocaleString('tr-TR')}\n`;
  output += `📊 Toplam Dosya: ${collected.size}\n\n`;
  
  // Dosyaları sırala (hedef dosya ilk, sonra alfabetik)
  const sortedFiles = Array.from(collected.keys()).sort((a, b) => {
    const relA = path.relative(PROJECT_ROOT, a);
    const relB = path.relative(PROJECT_ROOT, b);
    
    // Hedef dosya ilk olsun
    if (relA === normalizePath(TARGET_FILE)) return -1;
    if (relB === normalizePath(TARGET_FILE)) return 1;
    
    // Sonra app/ dizini
    if (relA.startsWith('app/') && !relB.startsWith('app/')) return -1;
    if (!relA.startsWith('app/') && relB.startsWith('app/')) return 1;
    
    // Sonra components/
    if (relA.startsWith('components/') && !relB.startsWith('components/')) return -1;
    if (!relA.startsWith('components/') && relB.startsWith('components/')) return 1;
    
    // Sonra lib/
    if (relA.startsWith('lib/') && !relB.startsWith('lib/')) return -1;
    if (!relA.startsWith('lib/') && relB.startsWith('lib/')) return 1;
    
    return relA.localeCompare(relB);
  });
  
  // Her dosyanın içeriğini ekle
  for (const filePath of sortedFiles) {
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const content = collected.get(filePath);
    const lines = content.split('\n').length;
    const size = Buffer.byteLength(content, 'utf8');
    
    output += '\n' + '─'.repeat(80) + '\n';
    output += `📄 ${relativePath}\n`;
    output += `📊 ${lines} satır | ${size} bytes\n`;
    output += '─'.repeat(80) + '\n\n';
    output += content + '\n';
  }
  
  // Özet
  output += '\n' + '='.repeat(80) + '\n';
  output += '📊 ÖZET\n';
  output += '='.repeat(80) + '\n';
  
  const totalLines = Array.from(collected.values())
    .reduce((sum, content) => sum + content.split('\n').length, 0);
  const totalSize = Array.from(collected.values())
    .reduce((sum, content) => sum + Buffer.byteLength(content, 'utf8'), 0);
  
  output += `Toplam Dosya: ${collected.size}\n`;
  output += `Toplam Satır: ${totalLines}\n`;
  output += `Toplam Boyut: ${totalSize} bytes\n`;
  
  // Dosya listesi
  output += '\n📋 DOSYA LİSTESİ:\n';
  sortedFiles.forEach((filePath, index) => {
    const relPath = path.relative(PROJECT_ROOT, filePath);
    const content = collected.get(filePath);
    const lines = content.split('\n').length;
    output += `${(index + 1).toString().padStart(3)}. ${relPath} (${lines} satır)\n`;
  });
  
  output += '='.repeat(80);
  
  // Dosyaya yaz
  const outputFile = `dependencies-${Date.now()}.txt`;
  fs.writeFileSync(outputFile, output, 'utf-8');
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ TAMAMLANDI!');
  console.log(`📁 Toplam ${collected.size} dosya toplandı`);
  console.log(`📄 Çıktı: ${outputFile}`);
  console.log('='.repeat(50));
  
  return outputFile;
}

// Ana fonksiyon
async function main() {
  console.log(`🎯 Hedef: ${TARGET_FILE}`);
  console.log(`📁 Proje: ${PROJECT_ROOT}`);
  console.log('─'.repeat(50) + '\n');
  
  try {
    // Başlangıç dosyasını topla
    await collectFile(TARGET_FILE);
    
    // Eğer hiç dosya toplanmadıysa, manuel olarak ara
    if (collected.size <= 1) {
      console.log('\n⚠️  Otomatik tarama yetersiz kaldı. Manuel tarama yapılıyor...\n');
      
      // Manuel olarak common dosyaları ara
      const commonFiles = [
        'app/products/[id]/page.tsx',
        'components/Header.tsx',
        'components/Footer.tsx',
        'components/SpotCard.tsx',
        'lib/supabase.ts',
        'components/ui/button.tsx',
        'components/ui/card.tsx',
      ];
      
      for (const file of commonFiles) {
        const fullPath = path.join(PROJECT_ROOT, file);
        if (fs.existsSync(fullPath) && !visited.has(normalizePath(fullPath))) {
          console.log(`📄 ${file} (manuel ekleme)`);
          await collectFile(fullPath);
        }
      }
    }
    
    // Sonuçları yaz
    const outputFile = writeOutput();
    
    // Kısa özet göster
    console.log('\n📋 TOPLANAN DOSYALAR:');
    Array.from(collected.keys())
      .map(p => path.relative(PROJECT_ROOT, p))
      .forEach((p, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${p}`);
      });
    
    console.log(`\n✨ ${outputFile} dosyası oluşturuldu.`);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

// Çalıştır
main();